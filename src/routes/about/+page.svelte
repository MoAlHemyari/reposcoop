<script lang="ts">
</script>

<div class="container mx-auto p-4">
  <header class="mb-6">
    <h1 class="mb-2 text-3xl font-bold">About RepoScoop</h1>
    <p class="text-xl">Skim GitHub release notes in a single glance.</p>
  </header>

  <div class="mb-4">
    <button class="btn btn-outline" onclick={() => history.back()}>Back</button>
  </div>

  <div class="prose max-w-none">
    <p class="mb-4">
      RepoScoop solves the pain of navigating releases in large repositories—especially monorepos. Paste any GitHub repo
      URL and get an instant, collapsible view of each package's versions alongside their release notes, grouped by
      package name for quick scanning.
    </p>

    <h2 class="mt-6 mb-3 text-2xl font-semibold">Core Features</h2>
    <ul class="mb-4 list-disc pl-6">
      <li><strong>Single‑input workflow</strong> – one textbox, one button.</li>
      <li><strong>Smart grouping</strong> – releases organized by detected package name.</li>
      <li>
        <strong>Collapsible drill‑down</strong> – expand a package to see version tags and full release bodies.
      </li>
      <li><strong>Clean UI</strong> – built with shadcn‑svelte for accessibility and speed.</li>
    </ul>

    <h2 class="mt-6 mb-3 text-2xl font-semibold">How It Works</h2>
    <p class="mb-4">
      RepoScoop fetches release data from the GitHub API and uses a smart algorithm to detect package names from release
      titles. It then groups releases by package name and displays them in a clean, organized interface.
    </p>
  </div>
</div>
