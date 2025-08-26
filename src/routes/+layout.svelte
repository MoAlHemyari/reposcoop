<script lang="ts">
  import '../app.css';
  import { browser, dev } from '$app/environment';
  import { env } from '$env/dynamic/public';

  let { children } = $props();

  // Get Umami configuration from environment
  const umami = {
    scriptUrl: env.PUBLIC_UMAMI_SCRIPT_URL || 'https://cloud.umami.is/script.js',
    websiteId: env.PUBLIC_UMAMI_WEBSITE_ID,
  };
</script>

<svelte:head>
  {#if browser && !dev && umami.websiteId}
    <script defer src={umami.scriptUrl} data-website-id={umami.websiteId}></script>
  {/if}
</svelte:head>

{@render children()}
