<script lang="ts">
  import type { PackageGroup } from '$lib/utils/release-grouping';
  import GroupReleasesList from './GroupReleasesList.svelte';

  let { group, index = 0, maxHeight = '24rem', 'on:toggle': ontoggle } = $props<{
    group: PackageGroup;
    index?: number;
    maxHeight?: string | number;
    'on:toggle'?: (detail: { expanded: boolean }) => void;
  }>();

  function toggle(e?: Event) {
    if (e) e.stopPropagation();
    group.isExpanded = !group.isExpanded;
    ontoggle?.({ expanded: !!group.isExpanded });
  }
</script>

<div class="border rounded-lg overflow-hidden bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all">
  <!-- Header -->
  <div
    class="p-4 bg-gray-50 dark:bg-gray-700 border-b cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
    onclick={toggle}
    onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(e); } }}
    tabindex="0"
    role="button"
    aria-expanded={group.isExpanded || false}
    aria-controls={`releases-${group.name.replace(/[^a-zA-Z0-9]/g, '-')}`}
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

  <!-- Summary (collapsed) -->
  {#if !group.isExpanded}
    <div class="p-4">
      <p class="text-sm mb-2">Latest version: <span class="font-mono">{group.latestRelease.version || group.latestRelease.tag_name}</span></p>
      <button
        class="w-full border rounded-md py-1.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
        onclick={(e) => { e.stopPropagation(); group.isExpanded = true; }}
      >
        View Releases
      </button>
    </div>
  {/if}

  <!-- Expanded Releases -->
  {#if group.isExpanded}
    <div id={`releases-${group.name.replace(/[^a-zA-Z0-9]/g, '-')}`}>
      <GroupReleasesList releases={group.releases} maxHeight={maxHeight} on:collapse={() => (group.isExpanded = false)} />
    </div>
  {/if}
</div>
