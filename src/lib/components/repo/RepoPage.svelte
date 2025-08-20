<script lang="ts">
  import { RepoReleases } from '$lib/components/repo';
  let { owner, repo } = $props<{ owner: string; repo: string }>();
</script>

<RepoReleases {owner} {repo} />
