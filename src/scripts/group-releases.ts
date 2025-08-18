/*
  Bun script to group releases by package using src/lib/utils/release-grouping.ts

  Usage:
    bun run src/scripts/group-releases.ts <input.json> [output.json]

  Defaults:
    - If no input is provided, uses src/test/examples/clerk.javasctipt.input.json
    - If no output is provided, writes next to input replacing .input.json with .output.json
*/

import { groupReleasesByPackage } from '../lib/utils/release-grouping';
import type { Release } from '../lib/services/repo-api';

function deriveDefaultOutputPath(inputPath: string): string {
	// Replace trailing .input.json with .output.json if present; otherwise append .output.json
	if (/\.input\.json$/i.test(inputPath)) return inputPath.replace(/\.input\.json$/i, '.output.json');
	if (/\.json$/i.test(inputPath)) return inputPath.replace(/\.json$/i, '.output.json');
	return inputPath + '.output.json';
}

function toRelease(obj: any, idx: number): Release {
	// Map a minimal object to the Release interface with safe defaults
	const created = obj?.created_at ?? obj?.published_at ?? new Date(0).toISOString();
	const published = obj?.published_at ?? obj?.created_at ?? created;
	return {
		id: obj?.id ?? idx,
		url: obj?.url ?? '',
		html_url: obj?.html_url ?? '',
		tag_name: String(obj?.tag_name ?? ''),
		name: String(obj?.name ?? obj?.tag_name ?? ''),
		draft: Boolean(obj?.draft ?? false),
		prerelease: Boolean(obj?.prerelease ?? false),
		created_at: String(created),
		published_at: String(published),
		body: String(obj?.body ?? ''),
		author: {
			login: String(obj?.author?.login ?? ''),
			avatar_url: String(obj?.author?.avatar_url ?? ''),
			html_url: String(obj?.author?.html_url ?? '')
		}
	} satisfies Release;
}

async function main() {
	const [, , inputArg, outputArg] = Bun.argv;

	const inputPath = inputArg ?? 'src/test/examples/facebook.react.input.json';
	const outputPath = outputArg ?? deriveDefaultOutputPath(inputPath);

	try {
		const inputFile = Bun.file(inputPath);
		if (!(await inputFile.exists())) {
			console.error(`Input file not found: ${inputPath}`);
			return process.exit(1);
		}

		const raw = await inputFile.json();

		if (!Array.isArray(raw)) {
			console.error('Input JSON must be an array of release-like objects');
			return process.exit(1);
		}

		const releases: Release[] = raw.map(toRelease);

		const grouped = groupReleasesByPackage(releases);

		// Write pretty JSON output
		const outputJson = JSON.stringify(grouped, null, 2);
		await Bun.write(outputPath, outputJson);

		console.log(`Grouped ${grouped.totalReleases} releases into ${grouped.groups.length} package group(s).`);
		console.log(`Output written to: ${outputPath}`);
	} catch (err) {
		console.error('Failed to process releases:', err);
		return process.exit(1);
	}
}

await main();
