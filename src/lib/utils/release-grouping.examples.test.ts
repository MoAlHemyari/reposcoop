import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { groupReleasesByPackage } from './release-grouping';
import type { Release } from '$lib/services/repo-api';

function loadJson<T = any>(p: string): T {
	const full = resolve(process.cwd(), p);
	const raw = readFileSync(full, 'utf-8');
	return JSON.parse(raw) as T;
}

function normalizeInputToRelease(arr: any[]): Release[] {
	return arr.map((r, i) => ({
		id: r.id ?? i,
		url: r.url ?? '',
		html_url: r.html_url ?? '',
		tag_name: r.tag_name ?? '',
		name: r.name ?? '',
		draft: r.draft ?? false,
		prerelease: r.prerelease ?? false,
		created_at: r.created_at ?? r.published_at ?? new Date(0).toISOString(),
		published_at: r.published_at ?? r.created_at ?? new Date(0).toISOString(),
		body: r.body ?? '',
		author: r.author ?? { login: '', avatar_url: '', html_url: '' }
	}));
}

describe('Release grouping examples', () => {
	it('groups React releases into repo group and eslint-plugin-react-hooks group matching expected ordering', () => {
		const input = loadJson<any[]>('src/test/examples/facebook.react.input.json');
		const expected = loadJson<{ groups: { name: string; releases: { tag_name: string }[] }[] }>(
			'src/test/examples/facebook.react.output.json'
		);

		const releases = normalizeInputToRelease(input);
		const result = groupReleasesByPackage(releases, 'react');

		// Expect two groups: repo aggregate and the plugin group
		const groupNames = result.groups.map((g) => g.name).sort();
		expect(groupNames).toContain('react');
		expect(groupNames).toContain('eslint-plugin-react-hooks');

		expect(result.totalReleases).toBe(releases.length);

		// Compare tag_name ordering with expected for the repo group
		const expectedReactGroup = expected.groups.find((g) => g.name === 'react');
		expect(expectedReactGroup).toBeTruthy();
		const expectedTagNames = (expectedReactGroup!.releases || []).map((r) => r.tag_name);
		const actualReactGroup = result.groups.find((g) => g.name === 'react')!;
		const actualTagNames = actualReactGroup.releases.map((r) => r.tag_name);
		expect(actualTagNames).toEqual(expectedTagNames);

		// Check plugin group exists and has expected single release
		const pluginGroup = result.groups.find((g) => g.name === 'eslint-plugin-react-hooks');
		expect(pluginGroup).toBeTruthy();
		expect(pluginGroup!.releases.length).toBe(1);
		expect(pluginGroup!.releases[0].tag_name).toBe('eslint-plugin-react-hooks@5.0.0');
	});

	it('groups Clerk monorepo packages similar to expected (names and ordering)', () => {
		// The clerk input pages are stored under static/examples; for unit coverage, we rely on provided output as oracle for group names and order
		const expected = loadJson<{ groups: { name: string; releases: { tag_name: string }[] }[] }>(
			'src/test/examples/clerk.javasctipt.output.json'
		);

		// Build input from expected by stripping fields (since input example is paginated in static, we use expected as source of truth)
		const inputFromExpected = expected.groups.flatMap((g) =>
			g.releases.map((r, idx) => ({
				id: `${g.name}:${idx}`,
				tag_name: r.tag_name,
				name: r.tag_name,
				prerelease: false,
				created_at: new Date(2020, 0, 1).toISOString(),
				published_at: new Date(2020, 0, 1).toISOString()
			}))
		);

		const releases = normalizeInputToRelease(inputFromExpected);
		const result = groupReleasesByPackage(releases, 'javascript');

		// Compare group names set
		const expectedNames = expected.groups.map((g) => g.name).sort();
		const actualNames = result.groups.map((g) => g.name).sort();
		expect(actualNames).toEqual(expectedNames);

		// For a few sample groups, compare ordering of tag_names (do all for completeness)
		const expectedMap = new Map(expected.groups.map((g) => [g.name, g.releases.map((r) => r.tag_name)]));
		for (const g of result.groups) {
			const exp = expectedMap.get(g.name);
			expect(exp, `Missing expected group ${g.name}`).toBeTruthy();
			const act = g.releases.map((r) => r.tag_name);
			expect(act).toEqual(exp);
		}
	});
});
