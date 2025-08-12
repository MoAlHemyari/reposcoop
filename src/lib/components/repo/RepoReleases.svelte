<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Markdown } from '$lib/components/ui/markdown';
	import { onMount } from 'svelte';
	import { slide, fade, fly } from 'svelte/transition';
	import { fetchReleasesByPage, retryWithBackoff } from '$lib/services/github-api';
	import type { Release, ApiResponse } from '$lib/services/repo-api';
	import {
		groupReleasesByPackage,
		sortPackageGroups,
		type GroupedReleases,
		type PackageGroup
	} from '$lib/utils/release-grouping';

	// Props
	let { owner, repo } = $props<{ owner: string; repo: string }>();

	// State variables
	let loading = $state(true);
	let loadingMore = $state(false);
	let error = $state<string | null>(null);
	let releases = $state<Release[]>([]);
	let apiResponse = $state<ApiResponse | null>(null);
	let groupedReleases = $state<GroupedReleases | null>(null);
	let retryCount = $state(0);
	let dataLoaded = $state(false); // Flag to track when data is loaded for animations
	const maxRetries = 3;

	// Pagination state
	let currentPage = $state(0);
	let lastPage = $state<number | null>(null);
	const initialPagesToLoad = 5;
	const pagesPerClick = 2;
	let rateLimitMessage = $state<string | null>(null);
	let rateLimitHitOnFirst = $state(false);

	// Sorting options
	let sortBy = $state<'name' | 'count' | 'date'>('name');
	let sortOrder = $state<'asc' | 'desc'>('asc');
	let sortedGroups = $state<PackageGroup[]>([]);

	// Filter options
	let filterText = $state('');

	// Fetch releases by pages with pagination
	async function fetchPage(pageNumber: number): Promise<boolean> {
		try {
			let resp: ApiResponse;
			if (typeof retryWithBackoff !== 'function') {
				resp = await fetchReleasesByPage(owner, repo, pageNumber);
			} else {
				resp = await retryWithBackoff(() => fetchReleasesByPage(owner, repo, pageNumber), maxRetries);
			}
			// Update lastPage from response if not set yet
			lastPage = resp.meta.lastPage ?? lastPage;
			apiResponse = resp; // keep latest meta/rate info
			// Append releases and regroup
			releases = [...releases, ...resp.releases];
				groupedReleases = groupReleasesByPackage(releases, repo);
				updateSortedGroups();
			return true;
		} catch (err) {
			const msg = err instanceof Error ? err.message : String(err);
			// Detect rate limit and set message; do not set error to keep displaying partial data
			if (msg.toLowerCase().includes('rate limit')) {
				rateLimitMessage = msg;
				if (pageNumber === 1 && releases.length === 0) {
					rateLimitHitOnFirst = true;
				}
				return false;
			}
			// For non-rate-limit errors, only set error if we have nothing to show
			if (releases.length === 0) {
				error = err instanceof Error ? err.message : 'An unknown error occurred while fetching repository data';
			}
			console.error('Error fetching releases page', pageNumber, err);
			return false;
		}
	}

	async function initialLoad() {
		loading = true;
		error = null;
		rateLimitMessage = null;
		rateLimitHitOnFirst = false;
		dataLoaded = false;
		releases = [];
		groupedReleases = null;
		currentPage = 0;
		lastPage = null;
		// First page to get lastPage, then up to 5 pages total (or until lastPage)
		const okFirst = await fetchPage(1);
		if (okFirst) {
			currentPage = 1;
			// Load up to total of 5 pages
			for (let i = 2; i <= initialPagesToLoad; i++) {
				if (lastPage && currentPage >= lastPage) break;
				const ok = await fetchPage(i);
				if (!ok) break; // stop on rate limit or error
				currentPage = i;
			}
		}
		// Finish loading state but keep any partial data visible
		setTimeout(() => {
			dataLoaded = true;
		}, 100);
		loading = false;
	}

	async function loadMore() {
		if (loadingMore) return;
		loadingMore = true;
		rateLimitMessage = null; // will be set again if it happens
		let loaded = 0;
		for (let i = 0; i < pagesPerClick; i++) {
			if (lastPage && currentPage >= lastPage) break;
			const next = currentPage + 1;
			const ok = await fetchPage(next);
			if (!ok) break;
			currentPage = next;
			loaded++;
		}
		loadingMore = false;
	}

	// Update sorted groups when sort options change
	function updateSortedGroups() {
		if (!groupedReleases) return;

		// Apply sorting
		sortedGroups = sortPackageGroups(groupedReleases.groups, sortBy, sortOrder);

		// Apply filtering if needed
		if (filterText) {
			sortedGroups = sortedGroups.filter((group) => group.name.toLowerCase().includes(filterText.toLowerCase()));
		}
	}

	// Watch for changes to sort options
	$effect(() => {
		if (sortBy || sortOrder) {
			updateSortedGroups();
		}
	});

	// Watch for changes to filter text
	$effect(() => {
		if (filterText !== undefined) {
			updateSortedGroups();
		}
	});

	// Retry fetching releases (re-run initial load)
	function handleRetry() {
		retryCount++;
		initialLoad();
	}

	// Fetch releases on component mount
	onMount(() => {
		initialLoad();
	});
</script>

<style>
	/* Custom styles for release previews */
	:global(.release-preview) {
		font-size: 0.875rem;
		line-height: 1.5;
	}

	:global(.release-preview h1),
	:global(.release-preview h2),
	:global(.release-preview h3) {
		font-size: 1rem;
		margin-top: 0.5rem;
		margin-bottom: 0.25rem;
	}

	:global(.release-preview p) {
		margin-bottom: 0.5rem;
	}

	:global(.release-preview ul),
	:global(.release-preview ol) {
		margin-left: 1rem;
		margin-bottom: 0.5rem;
	}

	:global(.release-preview li) {
		margin-bottom: 0.125rem;
	}

	:global(.release-preview pre),
	:global(.release-preview blockquote) {
		margin-bottom: 0.5rem;
	}

	/* Fade out the bottom of the preview */
	.max-h-24 {
		position: relative;
	}

	.max-h-24::after {
		content: '';
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		height: 20px;
		background: linear-gradient(to bottom, transparent, white);
	}

	:global(.dark) .max-h-24::after {
		background: linear-gradient(to bottom, transparent, rgb(31, 41, 55));
	}
</style>

<div class="container mx-auto p-4">
	<header class="mb-6">
		<h1 class="text-3xl font-bold">
			{owner}/{repo}
		</h1>
		<p class="text-muted-foreground">Repository releases grouped by package</p>
	</header>

	<div class="mb-4 flex flex-col sm:flex-row gap-3 justify-between items-start">
		<Button variant="outline" onclick={() => history.back()}>Back</Button>

		{#if groupedReleases && !loading && !error}
			<div class="w-full sm:w-auto flex flex-col sm:flex-row gap-3 items-start sm:items-center">
				<!-- Filter Input -->
				<div class="relative w-full sm:w-auto">
					<label for="package-filter" class="sr-only">Filter packages</label>
					<input
						id="package-filter"
						type="text"
						placeholder="Filter packages..."
						bind:value={filterText}
						class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						aria-label="Filter packages by name"
					/>
					{#if filterText}
						<button
							class="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
							onclick={() => (filterText = '')}
							aria-label="Clear filter"
							tabindex="0"
							onkeydown={(e) => {
								if (e.key === 'Enter' || e.key === ' ') {
									e.preventDefault();
									filterText = '';
								}
							}}
						>
							<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
							</svg>
						</button>
					{/if}
				</div>

				<!-- Sort Controls -->
				<div
					class="flex border rounded-md overflow-hidden w-full sm:w-auto"
					role="group"
					aria-label="Sort options"
				>
					<button
						class="flex-1 sm:flex-none px-3 py-2 text-sm {sortBy === 'name' ? 'bg-blue-100 dark:bg-blue-900' : 'bg-white dark:bg-gray-800'}"
						onclick={() => {
							sortBy = 'name';
							sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
						}}
						aria-label={`Sort by name ${sortBy === 'name' ? (sortOrder === 'asc' ? 'ascending' : 'descending') : ''}`}
						aria-pressed={sortBy === 'name'}
						tabindex="0"
						onkeydown={(e) => {
							if (e.key === 'Enter' || e.key === ' ') {
								e.preventDefault();
								sortBy = 'name';
								sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
							}
						}}
					>
						Name {sortBy === 'name' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
					</button>
					<button
						class="flex-1 sm:flex-none px-3 py-2 text-sm border-l {sortBy === 'count' ? 'bg-blue-100 dark:bg-blue-900' : 'bg-white dark:bg-gray-800'}"
						onclick={() => {
							sortBy = 'count';
							sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
						}}
						aria-label={`Sort by count ${sortBy === 'count' ? (sortOrder === 'asc' ? 'ascending' : 'descending') : ''}`}
						aria-pressed={sortBy === 'count'}
						tabindex="0"
						onkeydown={(e) => {
							if (e.key === 'Enter' || e.key === ' ') {
								e.preventDefault();
								sortBy = 'count';
								sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
							}
						}}
					>
						Count {sortBy === 'count' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
					</button>
					<button
						class="flex-1 sm:flex-none px-3 py-2 text-sm border-l {sortBy === 'date' ? 'bg-blue-100 dark:bg-blue-900' : 'bg-white dark:bg-gray-800'}"
						onclick={() => {
							sortBy = 'date';
							sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
						}}
						aria-label={`Sort by date ${sortBy === 'date' ? (sortOrder === 'asc' ? 'ascending' : 'descending') : ''}`}
						aria-pressed={sortBy === 'date'}
						tabindex="0"
						onkeydown={(e) => {
							if (e.key === 'Enter' || e.key === ' ') {
								e.preventDefault();
								sortBy = 'date';
								sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
							}
						}}
					>
						Date {sortBy === 'date' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
					</button>
				</div>

			</div>
		{/if}
	</div>

	{#if !loading}
		<div class="mb-4 flex flex-wrap items-center gap-3">
			<Button
				onclick={loadMore}
				disabled={loadingMore || (lastPage !== null && currentPage >= lastPage)}
				variant="outline"
			>
				{loadingMore ? 'Loading…' : 'Load more releases (2 pages)'}
			</Button>
			{#if rateLimitMessage}
				<span class="text-xs text-amber-600">Rate limit hit: {rateLimitMessage}</span>
			{/if}
			{#if lastPage !== null}
				<span class="text-xs text-gray-500">Page {Math.max(currentPage, 0)}/{lastPage}</span>
			{/if}
		</div>
	{/if}

	<div class="grid gap-4">
		{#if loading}
			<div class="p-6 border rounded-lg bg-gray-50 dark:bg-gray-800 shadow-sm">
				<div class="flex flex-col items-center justify-center py-8">
					<div class="mb-6 relative">
						<svg class="animate-spin h-12 w-12 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
							<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
							<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
						</svg>
						<div class="absolute inset-0 flex items-center justify-center">
							<div class="h-2 w-2 bg-blue-600 rounded-full"></div>
						</div>
					</div>
					<h2 class="text-xl font-semibold mb-3">Loading Repository Data</h2>
					<p class="text-gray-600 dark:text-gray-300 text-center max-w-md">
						Please wait while we fetch and process the releases for this repository.
					</p>
					<div class="mt-4 text-xs text-gray-500 dark:text-gray-400">
						This may take a moment for repositories with many releases.
					</div>
				</div>
			</div>
		{:else if error}
			<div class="p-6 border border-red-200 rounded-lg bg-red-50 dark:bg-red-900/20 dark:border-red-800 shadow-sm">
				<div class="flex flex-col md:flex-row items-center md:items-start gap-6 py-6">
					<div class="text-red-500 flex-shrink-0">
						<svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
						</svg>
					</div>
					<div class="flex-grow text-center md:text-left">
						<h2 class="text-xl font-semibold mb-3 text-red-700 dark:text-red-400">Error Loading Repository</h2>
						<p class="text-red-600 dark:text-red-300 mb-4 max-w-xl">{error}</p>
						<div class="flex justify-center md:justify-start">
							<Button onclick={handleRetry} variant="outline" class="border-red-300 dark:border-red-700">
								{retryCount >= maxRetries ? 'Try Again' : `Retry (Attempt ${retryCount + 1}/${maxRetries + 1})`}
							</Button>
						</div>
					</div>
				</div>
			</div>
		{:else if !groupedReleases || releases.length === 0}
			<div class="p-6 border rounded-lg bg-gray-50 dark:bg-gray-800 shadow-sm">
				<div class="flex flex-col md:flex-row items-center md:items-start gap-6 py-6">
					<div class="text-gray-400 flex-shrink-0">
						<svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
						</svg>
					</div>
					<div class="flex-grow text-center md:text-left">
						{#if rateLimitHitOnFirst}
							<h2 class="text-xl font-semibold mb-3">GitHub API rate limit reached</h2>
							<p class="text-gray-600 dark:text-gray-300 max-w-xl">
								{rateLimitMessage ?? 'You have hit the GitHub API rate limit. Please try again later or click “Load more” to retry after some time.'}
							</p>
						{:else}
							<h2 class="text-xl font-semibold mb-3">No Releases Found</h2>
							<p class="text-gray-600 dark:text-gray-300 max-w-xl">
								This repository doesn't have any releases yet. Releases are used to package and provide software to users.
							</p>
						{/if}
						<div class="mt-4">
							<a
								href={`https://github.com/${owner}/${repo}`}
								target="_blank"
								rel="noopener noreferrer"
								class="text-blue-600 dark:text-blue-400 hover:underline text-sm"
								aria-label={`View ${owner}/${repo} repository on GitHub (opens in new tab)`}
							>
								View repository on GitHub →
								<span class="sr-only">Opens in new tab</span>
							</a>
						</div>
					</div>
				</div>
			</div>
		{:else}
			<div class="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800" in:fade|local={{ duration: 300 }}>
				<div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2" in:fly|local={{ x: -20, duration: 300 }}>
					<div>
						<h2 class="text-lg font-semibold">Repository Summary</h2>
						<p class="text-sm text-gray-600 dark:text-gray-300">
							Found {groupedReleases.totalReleases} releases across {groupedReleases.groups.length} packages
						</p>
					</div>
					{#if apiResponse?.meta?.rateLimit}
						<div class="text-xs text-gray-500 dark:text-gray-400 bg-white/50 dark:bg-gray-800/50 px-2 py-1 rounded">
							API Rate Limit: {apiResponse.meta.rateLimit.remaining} / {apiResponse.meta.rateLimit.limit} remaining
						</div>
					{/if}
				</div>
			</div>

			<!-- Package Groups -->
			<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				{#each sortedGroups as group, i}
					<div
						in:fly|local={{ y: 20, delay: 50 * i, duration: 300, opacity: 0 }}
						class="border rounded-lg overflow-hidden bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all"
					>
						<!-- Package Header (always visible) -->
						<div
							class="p-4 bg-gray-50 dark:bg-gray-700 border-b cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
							onclick={() => (group.isExpanded = !group.isExpanded)}
							onkeydown={(e) => {
								if (e.key === 'Enter' || e.key === ' ') {
									e.preventDefault();
									group.isExpanded = !group.isExpanded;
								}
							}}
							tabindex="0"
							role="button"
							aria-expanded={group.isExpanded || false}
							aria-controls={`releases-${group.name.replace(/[^a-zA-Z0-9]/g, '-')}`}
							aria-label={`${group.name} package with ${group.releaseCount} releases. ${group.isExpanded ? 'Click to collapse' : 'Click to expand'}`}
						>
							<div class="flex justify-between items-center">
								<h3 class="font-semibold truncate" title={group.name}>{group.name}</h3>
								<div class="flex items-center gap-2">
									<span class="text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded-full">
										{group.releaseCount}
									</span>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										class="h-4 w-4 transition-transform duration-200 {group.isExpanded ? 'rotate-180' : ''}"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
									</svg>
								</div>
							</div>
							<p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
								Latest: {new Date(group.latestRelease.published_at || group.latestRelease.created_at).toLocaleDateString()}
							</p>
						</div>

						<!-- Package Summary (visible when collapsed) -->
						{#if !group.isExpanded}
							<div class="p-4">
								<p class="text-sm mb-2">Latest version: <span class="font-mono">{group.latestRelease.version || group.latestRelease.tag_name}</span></p>
								<Button
									variant="outline"
									size="sm"
									class="w-full"
									onclick={(e) => {
										e.stopPropagation();
										group.isExpanded = true;
									}}
								>
									View Releases
								</Button>
							</div>
						{/if}

						<!-- Releases List (visible when expanded) -->
						{#if group.isExpanded}
							<div
								id={`releases-${group.name.replace(/[^a-zA-Z0-9]/g, '-')}`}
								class="border-t divide-y divide-gray-100 dark:divide-gray-700 max-h-96 overflow-y-auto"
								transition:slide={{ duration: 300 }}
							>
								{#each group.releases as release, j}
									<div
										class="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
										in:fly|local={{ y: 10, delay: j * 30, duration: 200, opacity: 0 }}
									>
										<div class="flex justify-between items-start">
											<div class="flex-1 min-w-0">
												<h4 class="font-medium text-sm truncate" title={release.name || release.tag_name}>
													{release.version || release.tag_name}
												</h4>
												<p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
													{new Date(release.published_at || release.created_at).toLocaleDateString()}
												</p>
											</div>
											<a
												href={release.html_url}
												target="_blank"
												rel="noopener noreferrer"
												class="text-blue-600 dark:text-blue-400 hover:underline text-sm ml-2"
												aria-label={`View ${release.version || release.tag_name} on GitHub (opens in new tab)`}
											>
												<span>GitHub</span>
												<span class="sr-only">Opens in new tab</span>
											</a>
										</div>

										<!-- Release Notes with Toggle -->
										{#if release.body}
											<div class="mt-2 text-sm text-gray-600 dark:text-gray-300">
												<!-- Toggle Button -->
												<button
													class="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 mb-2 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-sm px-1"
													onclick={() => (release.notesExpanded = !release.notesExpanded)}
													aria-expanded={release.notesExpanded || false}
													aria-controls={`notes-${release.id}`}
												>
													<svg
														xmlns="http://www.w3.org/2000/svg"
														class="h-3 w-3 transition-transform duration-200 {release.notesExpanded ? 'rotate-90' : ''}"
														fill="none"
														viewBox="0 0 24 24"
														stroke="currentColor"
													>
														<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
													</svg>
													{release.notesExpanded ? 'Collapse notes' : 'Expand notes'}
												</button>

												<!-- Collapsed Preview -->
												{#if !release.notesExpanded}
													<div class="max-h-24 overflow-hidden relative">
														<Markdown content={release.body.substring(0, 150)} class="release-preview" />
														<div class="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white dark:from-gray-800 to-transparent"></div>
													</div>
												{:else}
													<!-- Expanded Full Content -->
													<div id={`notes-${release.id}`} transition:slide={{ duration: 200 }}>
														<Markdown content={release.body} class="release-preview" />
														<div class="text-xs text-blue-500 mt-2">
															<a
																href={release.html_url}
																target="_blank"
																rel="noopener noreferrer"
																aria-label={`View full release on GitHub for ${release.version || release.tag_name} (opens in new tab)`}
															>
																View on GitHub
																<span class="sr-only">Opens in new tab</span>
															</a>
														</div>
													</div>
												{/if}
										</div>
									{/if}
 							</div>
 							{/each}

 							<div class="p-3 bg-gray-50 dark:bg-gray-700 text-center">
									<Button
										variant="ghost"
										size="sm"
										onclick={(e) => {
											e.stopPropagation();
											group.isExpanded = false;
										}}
									>
										Collapse
									</Button>
								</div>
							</div>
						{/if}
					</div>
				{/each}
			</div>
			{/if}
	</div>
</div>
