/**
 * GitHub API Service
 *
 * This module provides a GitHub implementation of the RepoApiProvider interface
 * for interacting with the GitHub API, specifically for fetching repository releases.
 */

import type { ApiResponse, ApiResponseMeta, Release, RepoApiProvider } from './repo-api';

/**
 * GitHub-specific implementation of the Release interface
 */
export type GitHubRelease = Release;

/**
 * GitHub API Provider implementation
 */
export class GitHubApiProvider implements RepoApiProvider {
	/**
	 * Public wrapper to fetch a specific page of releases (for pagination use in UI)
	 */
	public async fetchReleasesByPage(owner: string, repo: string, page = 1, perPage = 100) {
		return this.fetchReleasesPage(owner, repo, page, perPage);
	}
	/**
	 * Extracts rate limit information from response headers
	 *
	 * @param headers - Response headers
	 * @returns Rate limit object
	 */
	private extractRateLimitInfo(headers: Headers): ApiResponseMeta['rateLimit'] {
		return {
			limit: parseInt(headers.get('x-ratelimit-limit') || '60', 10),
			remaining: parseInt(headers.get('x-ratelimit-remaining') || '0', 10),
			reset: parseInt(headers.get('x-ratelimit-reset') || '0', 10)
		};
	}

	/**
	 * Extracts pagination information from Link header
	 *
	 * @param linkHeader - Link header string
	 * @returns Last page number
	 */
	private extractLastPage(linkHeader: string | null): number {
		if (!linkHeader) return 1;

		const lastPageMatch = linkHeader.match(/page=(\d+)&per_page=\d+>; rel="last"/);
		return lastPageMatch ? parseInt(lastPageMatch[1], 10) : 1;
	}

	/**
	 * Fetches a single page of releases from the GitHub API
	 *
	 * @param owner - Repository owner
	 * @param repo - Repository name
	 * @param page - Page number
	 * @param perPage - Number of items per page
	 * @returns Promise with releases and metadata
	 * @throws Error if the API request fails
	 */
	private async fetchReleasesPage(owner: string, repo: string, page = 1, perPage = 100): Promise<ApiResponse> {
		const url = `https://api.github.com/repos/${owner}/${repo}/releases?page=${page}&per_page=${perPage}`;

		try {
			const response = await fetch(url, {
				headers: {
					Accept: 'application/vnd.github.v3+json',
					'User-Agent': 'RepoScoop'
				}
			});

			if (!response.ok) {
				if (response.status === 403 && response.headers.get('x-ratelimit-remaining') === '0') {
					const resetTime = new Date(parseInt(response.headers.get('x-ratelimit-reset') || '0', 10) * 1000);
					throw new Error(`GitHub API rate limit exceeded. Resets at ${resetTime.toLocaleTimeString()}`);
				}

				if (response.status === 404) {
					throw new Error(`Repository ${owner}/${repo} not found`);
				}

				throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
			}

			const releases = (await response.json()) as GitHubRelease[];
			const rateLimit = this.extractRateLimitInfo(response.headers);
			const lastPage = this.extractLastPage(response.headers.get('Link'));

			return {
				releases,
				meta: {
					rateLimit,
					lastPage
				}
			};
		} catch (error) {
			if (error instanceof Error) {
				throw error;
			}
			throw new Error('Failed to fetch releases from GitHub API');
		}
	}

	/**
	 * Loads example data for development purposes
	 *
	 * @param owner - Repository owner
	 * @param repo - Repository name
	 * @returns Promise with example data or null if not available
	 */
	private async loadExampleData(owner: string, repo: string): Promise<ApiResponse | null> {
		// Only attempt to load example data for specific repositories
		if (owner === 'clerk' && repo === 'javascript') {
			try {
				// Import all example data files
				const page1Url = '/examples/github/clerk/javascript/page1.jsonc?url';
				const page2Url = '/examples/github/clerk/javascript/page2.jsonc?url';
				const page3Url = '/examples/github/clerk/javascript/page3.jsonc?url';

				// Fetch the JSON data from the URLs
				const [page1Response, page2Response, page3Response] = await Promise.all([
					fetch(page1Url),
					fetch(page2Url),
					fetch(page3Url)
				]);

				const page1 = { default: await page1Response.json() };
				const page2 = { default: await page2Response.json() };
				const page3 = { default: await page3Response.json() };

				// Combine all releases
				const allReleases = [...page1.default, ...page2.default, ...page3.default];

				return {
					releases: allReleases,
					meta: {
						rateLimit: {
							limit: 60,
							remaining: 60,
							reset: 0
						},
						lastPage: 3,
						totalCount: allReleases.length
					}
				};
			} catch (error) {
				console.error('Failed to load example data:', error);
				return null;
			}
		}

		// Support react example in development
		if (owner === 'facebook' && repo === 'react') {
			try {
				const page1Url = '/examples/github/facebook/react/page1.json?url';
				const response = await fetch(page1Url);
				const page1 = await response.json();
				const allReleases = [...page1];
				return {
					releases: allReleases,
					meta: {
						rateLimit: { limit: 60, remaining: 60, reset: 0 },
						lastPage: 1,
						totalCount: allReleases.length
					}
				};
			} catch (error) {
				console.error('Failed to load example data for facebook/react:', error);
				return null;
			}
		}

		return null;
	}

	/**
	 * Fetches all releases for a repository from the GitHub API
	 *
	 * @param owner - Repository owner
	 * @param repo - Repository name
	 * @returns Promise with all releases and metadata
	 */
	public async fetchAllReleases(owner: string, repo: string): Promise<ApiResponse> {
		try {
			// In development mode, try to load example data first
			if (import.meta.env.DEV) {
				try {
					const exampleData = await this.loadExampleData(owner, repo);
					if (exampleData) {
						console.info(`Using example data for ${owner}/${repo} in development mode`);
						return exampleData;
					}
				} catch (exampleError) {
					console.error('Failed to load example data:', exampleError);
				}
			}

			// Fetch first page to get pagination info
			const firstPageResponse = await this.fetchReleasesPage(owner, repo);
			const { lastPage } = firstPageResponse.meta;

			let allReleases = [...firstPageResponse.releases];

			// Fetch remaining pages if there are any
			if (lastPage > 1) {
				const pagePromises = [];

				for (let page = 2; page <= lastPage; page++) {
					pagePromises.push(this.fetchReleasesPage(owner, repo, page));
				}

				const pageResponses = await Promise.all(pagePromises);

				for (const response of pageResponses) {
					allReleases = [...allReleases, ...response.releases];
				}
			}

			const result: ApiResponse = {
				releases: allReleases,
				meta: {
					...firstPageResponse.meta,
					totalCount: allReleases.length
				}
			};

			return result;
		} catch (error) {
			// Try to load example data again if available (for development) and we haven't tried already
			if (import.meta.env.DEV) {
				try {
					// This is a dynamic import that will be bundled only in development mode
					const exampleData = await this.loadExampleData(owner, repo);
					if (exampleData) {
						console.warn(`Using example data for ${owner}/${repo} due to API error:`, error);
						return exampleData;
					}
				} catch (exampleError) {
					console.error('Failed to load example data:', exampleError);
				}
			}

			// Re-throw the original error
			throw error;
		}
	}

	/**
	 * Retries a failed API request with exponential backoff
	 *
	 * @param fn - Function to retry
	 * @param retries - Maximum number of retries
	 * @param delay - Initial delay in milliseconds
	 * @returns Promise with the result of the function
	 */
	public async retryWithBackoff<T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
		try {
			return await fn();
		} catch (error) {
			if (retries === 0) {
				throw error;
			}

			// If rate limited, wait until reset time if possible
			if (error instanceof Error && error.message.includes('rate limit exceeded')) {
				const resetMatch = error.message.match(/Resets at (.+)$/);
				if (resetMatch) {
					const resetTime = new Date(resetMatch[1]);
					const waitTime = resetTime.getTime() - Date.now() + 1000; // Add 1 second buffer
					if (waitTime > 0 && waitTime < 15 * 60 * 1000) {
						// Don't wait more than 15 minutes
						await new Promise((resolve) => setTimeout(resolve, waitTime));
						return this.retryWithBackoff(fn, retries - 1, delay);
					}
				}
			}

			// Otherwise use exponential backoff
			await new Promise((resolve) => setTimeout(resolve, delay));
			return this.retryWithBackoff(fn, retries - 1, delay * 2);
		}
	}
}

// Create and export a singleton instance of the GitHub API provider
export const githubApi = new GitHubApiProvider();

// Export the methods directly for backward compatibility
// Use a safer approach to ensure githubApi is defined before destructuring
export const fetchAllReleases = (owner: string, repo: string) => githubApi.fetchAllReleases(owner, repo);
export const fetchReleasesByPage = (owner: string, repo: string, page = 1, perPage = 100) =>
	githubApi.fetchReleasesByPage(owner, repo, page, perPage);
export const retryWithBackoff = <T>(fn: () => Promise<T>, retries = 3, delay = 1000) =>
	githubApi.retryWithBackoff(fn, retries, delay);
