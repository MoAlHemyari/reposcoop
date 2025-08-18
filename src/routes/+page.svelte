<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { parseGitHubUrl } from '$lib/utils/github';
	import { formatDistanceToNow } from 'date-fns';

	type RecentRepo = {
		owner: string;
		repo: string;
		fullName: string;
		timestamp: string; // ISO string
	};

	type ExampleRepo = {
		name: string;
		description: string;
	};

	let repoUrl = $state<string>('');
	let isLoading = $state<boolean>(false);
	let validationError = $state<string>('');
	let recentRepos = $state<RecentRepo[]>([]);

	// Example repositories to try
	const exampleRepos: ExampleRepo[] = [
		{ name: 'clerk/javascript', description: 'Authentication library with multiple packages' },
		{ name: 'vercel/next.js', description: 'React framework with many releases' },
		{ name: 'sveltejs/kit', description: 'Svelte application framework' }
	];

	// Load recently viewed repositories from localStorage on component mount
	onMount((): void => {
		try {
			const storedRepos = localStorage.getItem('recentRepos');
			if (storedRepos) {
				recentRepos = JSON.parse(storedRepos) as RecentRepo[];
			}
		} catch (error) {
			console.error('Error loading recent repositories:', error);
		}
	});

	// Save a repository to recently viewed
	function saveToRecentRepos(owner: string, repo: string): void {
		try {
			// Create new repo object
			const newRepo: RecentRepo = {
				owner,
				repo,
				fullName: `${owner}/${repo}`,
				timestamp: new Date().toISOString()
			};

			// Add to the beginning of the array (most recent first)
			// Filter out any duplicates of the same repo
			recentRepos = [newRepo, ...recentRepos.filter((r) => r.fullName !== newRepo.fullName)].slice(0, 5); // Keep only the 5 most recent

			// Save to localStorage
			localStorage.setItem('recentRepos', JSON.stringify(recentRepos));
		} catch (error) {
			console.error('Error saving recent repository:', error);
		}
	}

	function handleSubmit(event: Event): void {
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

	function tryExampleRepo(event: Event, repo: string): void {
		repoUrl = `https://github.com/${repo}`;
		handleSubmit(event);
	}

	function viewRecentRepo(repo: RecentRepo): void {
		goto(`/r/${repo.owner}/${repo.repo}`);
	}
</script>

<div class="flex min-h-screen flex-col">
	<main class="flex-grow">
		<!-- Hero Section -->
		<section class="bg-gradient-to-b from-blue-50 to-white py-12 md:py-20 dark:from-gray-900 dark:to-gray-800">
			<div class="container mx-auto px-4">
				<div class="mx-auto max-w-4xl text-center">
					<h1
						class="mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-4xl font-bold text-transparent md:text-5xl"
					>
						Welcome to RepoScoop 📦🔍
					</h1>
					<p class="mb-4 text-xl md:text-2xl">Skim GitHub release notes in a single glance.</p>
					<p class="mx-auto mb-8 max-w-2xl text-lg text-gray-600 dark:text-gray-300">
						Paste any GitHub repo URL and get an instant, collapsible view of each package's versions, grouped by
						package name for quick scanning.
					</p>
				</div>
			</div>
		</section>

		<!-- Main Content -->
		<section class="py-12">
			<div class="container mx-auto px-4">
				<!-- Repository Input Form -->
				<div
					class="mx-auto mb-12 max-w-2xl rounded-lg border border-gray-200 bg-white p-6 shadow-md dark:border-gray-700 dark:bg-gray-800"
				>
					<h2 class="mb-4 text-2xl font-semibold">Enter a GitHub Repository</h2>
					<form onsubmit={handleSubmit} class="flex flex-col gap-4">
						<div>
							<label for="repo-url" class="mb-1 block text-sm font-medium">GitHub Repository URL</label>
							<div class="relative">
								<input
									id="repo-url"
									type="text"
									bind:value={repoUrl}
									placeholder="https://github.com/owner/repo"
									class="w-full rounded-md border p-3 pr-12 transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
									class:border-red-500={validationError}
									disabled={isLoading}
								/>
								{#if validationError}
									<div class="mt-1 text-sm text-red-500">{validationError}</div>
								{/if}
							</div>
						</div>
						<div>
							<Button type="submit" disabled={isLoading} class="w-full md:w-auto">
								{#if isLoading}
									<span class="mr-2 inline-block">Loading...</span>
									<svg
										class="inline-block h-4 w-4 animate-spin"
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
									>
										<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
										<path
											class="opacity-75"
											fill="currentColor"
											d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
										></path>
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
					<div class="mx-auto mb-8 max-w-2xl">
						<h3 class="mb-3 text-xl font-semibold">Recently Viewed</h3>
						<div
							class="overflow-hidden rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
						>
							{#each recentRepos as repo}
								<button
									onclick={() => viewRecentRepo(repo)}
									class="flex w-full items-center justify-between border-b border-gray-200 p-3 text-left transition-colors last:border-b-0 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-700"
								>
									<div>
										<div class="font-medium">{repo.fullName}</div>
										<div class="mt-1 text-xs text-gray-500 dark:text-gray-400">
											Viewed {formatDistanceToNow(new Date(repo.timestamp))}
										</div>
									</div>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										class="h-5 w-5 text-gray-400"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
									</svg>
								</button>
							{/each}
						</div>
					</div>
				{/if}

				<!-- Example Repositories -->
				<div class="mx-auto mb-12 max-w-2xl">
					<h3 class="mb-3 text-xl font-semibold">Or try one of these examples:</h3>
					<div class="grid grid-cols-1 gap-4 md:grid-cols-3">
						{#each exampleRepos as repo}
							<button
								onclick={(e) => tryExampleRepo(e, repo.name)}
								class="rounded-md border p-4 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
							>
								<div class="font-medium">{repo.name}</div>
								<div class="text-sm text-gray-600 dark:text-gray-300">{repo.description}</div>
							</button>
						{/each}
					</div>
				</div>

				<!-- How It Works Section -->
				<div class="mx-auto max-w-4xl">
					<h2 class="mb-6 text-center text-2xl font-semibold">How It Works</h2>
					<div class="grid grid-cols-1 gap-8 md:grid-cols-3">
						<div class="text-center">
							<div
								class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900"
							>
								<span class="text-2xl font-bold text-blue-600 dark:text-blue-300">1</span>
							</div>
							<h3 class="mb-2 font-semibold">Enter Repository URL</h3>
							<p class="text-gray-600 dark:text-gray-300">Paste any GitHub repository URL into the input field.</p>
						</div>
						<div class="text-center">
							<div
								class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900"
							>
								<span class="text-2xl font-bold text-blue-600 dark:text-blue-300">2</span>
							</div>
							<h3 class="mb-2 font-semibold">Smart Grouping</h3>
							<p class="text-gray-600 dark:text-gray-300">Releases are automatically grouped by package name.</p>
						</div>
						<div class="text-center">
							<div
								class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900"
							>
								<span class="text-2xl font-bold text-blue-600 dark:text-blue-300">3</span>
							</div>
							<h3 class="mb-2 font-semibold">Browse Releases</h3>
							<p class="text-gray-600 dark:text-gray-300">Expand packages to see all versions and release notes.</p>
						</div>
					</div>
				</div>
			</div>
		</section>
	</main>

	<!-- Footer -->
	<footer class="border-t border-gray-200 bg-gray-50 py-8 dark:border-gray-800 dark:bg-gray-900">
		<div class="container mx-auto px-4">
			<div class="flex flex-col items-center justify-between md:flex-row">
				<div class="mb-4 md:mb-0">
					<p class="text-gray-600 dark:text-gray-300">© 2025 RepoScoop. All rights reserved.</p>
				</div>
				<nav class="flex gap-6">
					<a href="/about" class="text-blue-600 hover:underline dark:text-blue-400">About</a>
					<a
						href="https://github.com/your-username/reposcoop"
						target="_blank"
						rel="noopener noreferrer"
						class="text-blue-600 hover:underline dark:text-blue-400">GitHub</a
					>
				</nav>
			</div>
		</div>
	</footer>
</div>
