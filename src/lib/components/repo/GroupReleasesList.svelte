<script lang="ts">
  import { Markdown } from '$lib/components/ui/markdown';
  import type { Release } from '$lib/services/repo-api';

  let { releases, maxHeight = '24rem', showCollapseButton = true, 'on:collapse': oncollapse } = $props<{
    releases: Release[];
    maxHeight?: string | number;
    showCollapseButton?: boolean;
    'on:collapse'?: () => void;
  }>();

</script>

<style>
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

<div class="border-t divide-y divide-gray-100 dark:divide-gray-700 overflow-y-auto" style={`max-height: ${typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight}`}>
  {#each releases as release, j}
    <div class="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
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
          <span class="sr-only">GitHub</span>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="h-4 w-4" aria-hidden="true"><path fill="currentColor" d="M12 2C6.48 2 2 6.58 2 12.26c0 4.51 2.87 8.33 6.84 9.68c.5.1.68-.22.68-.49c0-.24-.01-.87-.01-1.71c-2.78.62-3.37-1.2-3.37-1.2c-.45-1.18-1.11-1.49-1.11-1.49c-.91-.64.07-.63.07-.63c1 .07 1.52 1.05 1.52 1.05c.9 1.56 2.36 1.11 2.94.85c.09-.67.35-1.11.63-1.37c-2.22-.26-4.56-1.14-4.56-5.08c0-1.12.39-2.03 1.03-2.75c-.1-.26-.45-1.3.1-2.71c0 0 .84-.27 2.75 1.05c.8-.23 1.65-.35 2.5-.35s1.7.12 2.5.35c1.9-1.32 2.74-1.05 2.74-1.05c.55 1.41.2 2.45.1 2.71c.64.72 1.02 1.63 1.02 2.75c0 3.95-2.34 4.82-4.57 5.07c.36.32.68.95.68 1.92c0 1.39-.01 2.5-.01 2.84c0 .27.18.6.69.49C19.13 20.58 22 16.76 22 12.26C22 6.58 17.52 2 12 2"/></svg>
        </a>
      </div>

      {#if release.body}
        <div class="mt-2 text-sm text-gray-600 dark:text-gray-300">
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

          {#if !release.notesExpanded}
            <div class="max-h-24 overflow-hidden relative">
              <Markdown content={release.body.substring(0, 150)} class="release-preview" />
              <div class="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white dark:from-gray-800 to-transparent"></div>
            </div>
          {:else}
            <div id={`notes-${release.id}`}>
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

  {#if showCollapseButton}
    <div class="p-3 bg-gray-50 dark:bg-gray-700 text-center">
      <button
        class="text-sm text-blue-600 dark:text-blue-400 hover:underline"
        onclick={() => oncollapse?.() }
      >
        Collapse
      </button>
    </div>
  {/if}
</div>
