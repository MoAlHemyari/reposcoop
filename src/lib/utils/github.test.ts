import { describe, expect, it } from 'vitest';
import { formatGitHubUrl, isValidGitHubUrl, parseGitHubUrl } from './github';

describe('GitHub URL Utilities', () => {
	describe('parseGitHubUrl', () => {
		it('should parse a standard GitHub URL', () => {
			const result = parseGitHubUrl('https://github.com/sveltejs/kit');
			expect(result).toEqual({ owner: 'sveltejs', repo: 'kit' });
		});

		it('should parse a GitHub URL with www subdomain', () => {
			const result = parseGitHubUrl('https://www.github.com/vercel/next.js');
			expect(result).toEqual({ owner: 'vercel', repo: 'next.js' });
		});

		it('should parse a GitHub URL without protocol', () => {
			const result = parseGitHubUrl('github.com/facebook/react');
			expect(result).toEqual({ owner: 'facebook', repo: 'react' });
		});

		it('should parse a GitHub URL with trailing slash', () => {
			const result = parseGitHubUrl('https://github.com/tailwindlabs/tailwindcss/');
			expect(result).toEqual({ owner: 'tailwindlabs', repo: 'tailwindcss' });
		});

		it('should parse a GitHub URL with hash', () => {
			const result = parseGitHubUrl('https://github.com/sveltejs/svelte#readme');
			expect(result).toEqual({ owner: 'sveltejs', repo: 'svelte' });
		});

		it('should parse a GitHub URL with query parameters', () => {
			const result = parseGitHubUrl('https://github.com/microsoft/typescript?tab=readme-ov-file');
			expect(result).toEqual({ owner: 'microsoft', repo: 'typescript' });
		});

		it('should return null for an empty string', () => {
			const result = parseGitHubUrl('');
			expect(result).toBeNull();
		});

		it('should return null for a non-GitHub URL', () => {
			const result = parseGitHubUrl('https://gitlab.com/user/repo');
			expect(result).toBeNull();
		});

		it('should return null for a malformed GitHub URL', () => {
			const result = parseGitHubUrl('https://github.com/only-owner');
			expect(result).toBeNull();
		});

		it('should return null for a GitHub URL with invalid characters', () => {
			const result = parseGitHubUrl('https://github.com/user.name/repo');
			expect(result).toBeNull();
		});
	});

	describe('isValidGitHubUrl', () => {
		it('should return true for valid GitHub URLs', () => {
			expect(isValidGitHubUrl('https://github.com/sveltejs/kit')).toBe(true);
			expect(isValidGitHubUrl('http://github.com/vercel/next.js')).toBe(true);
			expect(isValidGitHubUrl('github.com/facebook/react')).toBe(true);
		});

		it('should return false for invalid GitHub URLs', () => {
			expect(isValidGitHubUrl('')).toBe(false);
			expect(isValidGitHubUrl('https://gitlab.com/user/repo')).toBe(false);
			expect(isValidGitHubUrl('https://github.com/only-owner')).toBe(false);
			expect(isValidGitHubUrl('github.com/user.name/repo')).toBe(false);
		});
	});

	describe('formatGitHubUrl', () => {
		it('should format owner and repo into a GitHub URL', () => {
			expect(formatGitHubUrl('sveltejs', 'kit')).toBe('https://github.com/sveltejs/kit');
			expect(formatGitHubUrl('vercel', 'next.js')).toBe('https://github.com/vercel/next.js');
			expect(formatGitHubUrl('facebook', 'react')).toBe('https://github.com/facebook/react');
		});
	});
});
