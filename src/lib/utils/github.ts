/**
 * Utility functions for GitHub repository URL parsing and validation
 */

/**
 * Parses a GitHub repository URL and extracts the owner and repository name
 *
 * @param url - The GitHub repository URL to parse
 * @returns An object with owner and repo properties if valid, or null if invalid
 *
 * @example
 * // Returns { owner: 'sveltejs', repo: 'kit' }
 * parseGitHubUrl('https://github.com/sveltejs/kit');
 *
 * // Returns { owner: 'vercel', repo: 'next.js' }
 * parseGitHubUrl('http://github.com/vercel/next.js/');
 *
 * // Returns { owner: 'facebook', repo: 'react' }
 * parseGitHubUrl('github.com/facebook/react');
 *
 * // Returns null (invalid URL)
 * parseGitHubUrl('https://gitlab.com/user/repo');
 */
export function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
	if (!url) return null;

	// Match GitHub repository URLs in various formats
	const githubRegex = /^(?:https?:\/\/)?(?:www\.)?github\.com\/([^/\s]+)\/([^/\s#?]+)(?:[/]?|#.*|$|\?.*)/i;
	const match = url.match(githubRegex);

	if (match) {
		const owner = match[1];
		const repo = match[2].split('#')[0].split('?')[0]; // Remove any hash or query params

		// Additional validation
		if (!owner || !repo || owner.includes('.')) {
			return null;
		}

		return { owner, repo };
	}

	return null;
}

/**
 * Validates if a string is a valid GitHub repository URL
 *
 * @param url - The URL to validate
 * @returns True if the URL is a valid GitHub repository URL, false otherwise
 *
 * @example
 * // Returns true
 * isValidGitHubUrl('https://github.com/sveltejs/kit');
 *
 * // Returns false
 * isValidGitHubUrl('https://gitlab.com/user/repo');
 */
export function isValidGitHubUrl(url: string): boolean {
	return parseGitHubUrl(url) !== null;
}

/**
 * Formats a GitHub repository URL from owner and repo
 *
 * @param owner - The repository owner/organization
 * @param repo - The repository name
 * @returns A formatted GitHub URL
 *
 * @example
 * // Returns 'https://github.com/sveltejs/kit'
 * formatGitHubUrl('sveltejs', 'kit');
 */
export function formatGitHubUrl(owner: string, repo: string): string {
	return `https://github.com/${owner}/${repo}`;
}
