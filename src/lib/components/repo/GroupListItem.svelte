<script lang="ts">
  import type { PackageGroup } from '$lib/utils/release-grouping';
  import GroupReleasesList from './GroupReleasesList.svelte';

  let { group, owner, repo, index = 0, maxHeight = '24rem', 'on:toggle': ontoggle } = $props<{
    group: PackageGroup;
    owner: string;
    repo: string;
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

<div class="border-b first:border-t dark:border-gray-700">
  <!-- Collapsed Row / Summary -->
  <div
    class="flex items-center gap-3 py-3 px-2 sm:px-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/70"
    role="button"
    tabindex="0"
    aria-expanded={group.isExpanded || false}
    aria-controls={`releases-${group.name.replace(/[^a-zA-Z0-9]/g, '-')}`}
    onclick={toggle}
    onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(e); } }}
  >
    <div class="flex-1 min-w-0">
      <div class="flex items-center gap-2">
        <h3 class="font-semibold truncate" title={group.name}>{group.name}</h3>
        <!-- release count chip -->
        <span class="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-1.5 py-0.5 rounded-full">
          {group.releaseCount}
        </span>
      </div>
      <div class="text-xs text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-2">
        <span>Latest:</span>
        <span class="font-mono truncate">{group.latestRelease.version || group.latestRelease.tag_name}</span>
        <span class="opacity-60">•</span>
        <span>{new Date(group.latestRelease.published_at || group.latestRelease.created_at).toLocaleDateString()}</span>
      </div>
    </div>

    <!-- Actions: expand chevron -->
    <div class="flex items-center gap-2 pl-2 flex-none">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 transition-transform duration-200 {group.isExpanded ? 'rotate-180' : ''}" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  </div>

  {#if group.isExpanded}
    <div id={`releases-${group.name.replace(/[^a-zA-Z0-9]/g, '-')}`} class="bg-gray-50/70 dark:bg-gray-800/60">
      <GroupReleasesList releases={group.releases} maxHeight={maxHeight} on:collapse={() => (group.isExpanded = false)} />
    </div>
  {/if}
</div>
