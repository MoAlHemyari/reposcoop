<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { parseGitHubUrl, formatGitHubUrl } from '$lib/utils/github';
    import { formatDistanceToNow } from "date-fns";

	let repoUrl = $state('');
	let isLoading = $state(false);
	let validationError = $state('');
	let recentRepos = $state([]);

	// Example repositories to try
	const exampleRepos = [
		{ name: 'clerk/javascript', description: 'Authentication library with multiple packages' },
		{ name: 'vercel/next.js', description: 'React framework with many releases' },
		{ name: 'sveltejs/kit', description: 'Svelte application framework' }
	];

	// Load recently viewed repositories from localStorage on component mount
	onMount(() => {
		try {
			const storedRepos = localStorage.getItem('recentRepos');
			if (storedRepos) {
				recentRepos = JSON.parse(storedRepos);
			}
		} catch (error) {
			console.error('Error loading recent repositories:', error);
		}
	});

	// Save a repository to recently viewed
	function saveToRecentRepos(owner, repo) {
		try {
			// Create new repo object
			const newRepo = {
				owner,
				repo,
				fullName: `${owner}/${repo}`,
				timestamp: new Date().toISOString()
			};

			// Add to the beginning of the array (most recent first)
			// Filter out any duplicates of the same repo
			recentRepos = [
				newRepo,
				...recentRepos.filter(r => r.fullName !== newRepo.fullName)
			].slice(0, 5); // Keep only the 5 most recent

			// Save to localStorage
			localStorage.setItem('recentRepos', JSON.stringify(recentRepos));
		} catch (error) {
			console.error('Error saving recent repository:', error);
		}
	}

	function handleSubmit(event: Event) {
        event.preventDefault();
		// Reset validation error
		validationError = '';

		// Parse and validate the GitHub repository URL
		const parsedUrl = parseGitHubUrl(repoUrl);

		if (parsedUrl) {
			isLoading = true;
			const { owner, repo } = parsedUrl;

			// Save to recently viewed repositories
			saveToRecentRepos(owner, repo);

			// Simulate a short delay to show loading state
			setTimeout(() => {
				goto(`/r/${owner}/${repo}`);
				isLoading = false;
			}, 500);
		} else {
			validationError = 'Please enter a valid GitHub repository URL (e.g., https://github.com/owner/repo)';
		}
	}

	function tryExampleRepo(event: Event, repo: string) {
		repoUrl = `https://github.com/${repo}`;
		handleSubmit(event);
	}

	function viewRecentRepo(repo) {
		goto(`/r/${repo.owner}/${repo.repo}`);
	}
</script>

<div class="min-h-screen flex flex-col">
	<main class="flex-grow">
		<!-- Hero Section -->
		<section class="bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 py-12 md:py-20">
			<div class="container mx-auto px-4">
				<div class="max-w-4xl mx-auto text-center">
					<h1 class="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
						Welcome to RepoScoop 📦🔍
					</h1>
					<p class="text-xl md:text-2xl mb-4">Skim GitHub release notes in a single glance.</p>
					<p class="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
						Paste any GitHub repo URL and get an instant, collapsible view of each package's versions,
						grouped by package name for quick scanning.
					</p>
				</div>
			</div>
		</section>

		<!-- Main Content -->
		<section class="py-12">
			<div class="container mx-auto px-4">
				<!-- Repository Input Form -->
				<div class="max-w-2xl mx-auto mb-12 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
					<h2 class="text-2xl font-semibold mb-4">Enter a GitHub Repository</h2>
					<form onsubmit={handleSubmit} class="flex flex-col gap-4">
						<div>
							<label for="repo-url" class="block text-sm font-medium mb-1">GitHub Repository URL</label>
							<div class="relative">
								<input
									id="repo-url"
									type="text"
									bind:value={repoUrl}
									placeholder="https://github.com/owner/repo"
									class="w-full p-3 pr-12 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
									class:border-red-500={validationError}
									disabled={isLoading}
								/>
								{#if validationError}
									<div class="text-red-500 text-sm mt-1">{validationError}</div>
								{/if}
							</div>
						</div>
						<div>
							<Button type="submit" disabled={isLoading} class="w-full md:w-auto">
								{#if isLoading}
									<span class="inline-block mr-2">Loading...</span>
									<svg class="animate-spin h-4 w-4 inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
										<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
										<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
									</svg>
								{:else}
									View Releases
								{/if}
							</Button>
						</div>
					</form>
				</div>

				<!-- Recently Viewed Repositories -->
				{#if recentRepos.length > 0}
					<div class="max-w-2xl mx-auto mb-8">
						<h3 class="text-xl font-semibold mb-3">Recently Viewed</h3>
						<div class="bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
							{#each recentRepos as repo}
								<button
									onclick={() => viewRecentRepo(repo)}
									class="w-full p-3 flex justify-between items-center border-b last:border-b-0 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
								>
									<div>
										<div class="font-medium">{repo.fullName}</div>
										<div class="text-xs text-gray-500 dark:text-gray-400 mt-1">
											Viewed {formatDistanceToNow(repo.timestamp)}
										</div>
									</div>
									<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
									</svg>
								</button>
							{/each}
						</div>
					</div>
				{/if}

				<!-- Example Repositories -->
				<div class="max-w-2xl mx-auto mb-12">
					<h3 class="text-xl font-semibold mb-3">Or try one of these examples:</h3>
					<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
						{#each exampleRepos as repo}
							<button
								onclick={(e) => tryExampleRepo(e, repo.name)}
								class="p-4 border rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
							>
								<div class="font-medium">{repo.name}</div>
								<div class="text-sm text-gray-600 dark:text-gray-300">{repo.description}</div>
							</button>
						{/each}
					</div>
				</div>

				<!-- How It Works Section -->
				<div class="max-w-4xl mx-auto">
					<h2 class="text-2xl font-semibold mb-6 text-center">How It Works</h2>
					<div class="grid grid-cols-1 md:grid-cols-3 gap-8">
						<div class="text-center">
							<div class="bg-blue-100 dark:bg-blue-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
								<span class="text-2xl font-bold text-blue-600 dark:text-blue-300">1</span>
							</div>
							<h3 class="font-semibold mb-2">Enter Repository URL</h3>
							<p class="text-gray-600 dark:text-gray-300">Paste any GitHub repository URL into the input field.</p>
						</div>
						<div class="text-center">
							<div class="bg-blue-100 dark:bg-blue-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
								<span class="text-2xl font-bold text-blue-600 dark:text-blue-300">2</span>
							</div>
							<h3 class="font-semibold mb-2">Smart Grouping</h3>
							<p class="text-gray-600 dark:text-gray-300">Releases are automatically grouped by package name.</p>
						</div>
						<div class="text-center">
							<div class="bg-blue-100 dark:bg-blue-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
								<span class="text-2xl font-bold text-blue-600 dark:text-blue-300">3</span>
							</div>
							<h3 class="font-semibold mb-2">Browse Releases</h3>
							<p class="text-gray-600 dark:text-gray-300">Expand packages to see all versions and release notes.</p>
						</div>
					</div>
				</div>
			</div>
		</section>
	</main>

	<!-- Footer -->
	<footer class="bg-gray-50 dark:bg-gray-900 py-8 border-t border-gray-200 dark:border-gray-800">
		<div class="container mx-auto px-4">
			<div class="flex flex-col md:flex-row justify-between items-center">
				<div class="mb-4 md:mb-0">
					<p class="text-gray-600 dark:text-gray-300">© 2025 RepoScoop. All rights reserved.</p>
				</div>
				<nav class="flex gap-6">
					<a href="/about" class="text-blue-600 dark:text-blue-400 hover:underline">About</a>
					<a href="https://github.com/your-username/reposcoop" target="_blank" rel="noopener noreferrer" class="text-blue-600 dark:text-blue-400 hover:underline">GitHub</a>
				</nav>
			</div>
		</div>
	</footer>
</div>
