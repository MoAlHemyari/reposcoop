// Simple script to test the clerk/javascript repository example in development mode
import { fetchAllReleases } from './src/lib/services/github-api';

// Mock fetch to simulate the example data loading
global.fetch = async (url) => {
	console.log('Fetching:', url);

	// Check if this is an example data URL
	if (url.includes('/examples/github/clerk/javascript/')) {
		// Return mock example data
		return {
			ok: true,
			json: async () => {
				return [
					{
						url: 'https://api.github.com/repos/clerk/javascript/releases/1',
						html_url: 'https://github.com/clerk/javascript/releases/tag/v1.0.0',
						id: 1,
						tag_name: 'v1.0.0',
						name: 'Version 1.0.0',
						draft: false,
						prerelease: false,
						created_at: '2023-01-01T00:00:00Z',
						published_at: '2023-01-01T00:00:00Z',
						body: 'Example release notes',
						author: {
							login: 'clerk-user',
							avatar_url: 'https://github.com/clerk-user.png',
							html_url: 'https://github.com/clerk-user'
						}
					}
				];
			}
		};
	}

	// For any other URL, simulate an error
	throw new Error('Network error (simulated)');
};

// Set development mode
globalThis.import = { meta: { env: { DEV: true } } };

async function testExampleData() {
	console.log('Testing example data for clerk/javascript repository...');

	try {
		const result = await fetchAllReleases('clerk', 'javascript');
		console.log(`Successfully loaded example data with ${result.releases.length} releases`);
		console.log('First release:', result.releases[0].tag_name);
		return true;
	} catch (error) {
		console.error('Failed to load example data:', error);
		return false;
	}
}

testExampleData().then((success) => {
	if (success) {
		console.log('Test passed: Example data loaded successfully');
	} else {
		console.log('Test failed: Could not load example data');
		process.exit(1);
	}
});
