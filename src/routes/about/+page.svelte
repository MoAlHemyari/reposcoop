<script lang="ts">
	import { Button } from '$lib/components/ui/button';
</script>

<div class="container mx-auto p-4">
	<header class="mb-6">
		<h1 class="text-3xl font-bold mb-2">About RepoScoop</h1>
		<p class="text-xl">Skim GitHub release notes in a single glance.</p>
	</header>

	<div class="mb-4">
		<Button variant="outline" onclick="history.back()">Back</Button>
	</div>

	<div class="prose max-w-none">
		<p class="mb-4">
			RepoScoop solves the pain of navigating releases in large repositories—especially monorepos.
			Paste any GitHub repo URL and get an instant, collapsible view of each package's versions
			alongside their release notes, grouped by package name for quick scanning.
		</p>

		<h2 class="text-2xl font-semibold mt-6 mb-3">Core Features</h2>
		<ul class="list-disc pl-6 mb-4">
			<li><strong>Single‑input workflow</strong> – one textbox, one button.</li>
			<li><strong>Smart grouping</strong> – releases organized by detected package name.</li>
			<li><strong>Collapsible drill‑down</strong> – expand a package to see version tags and full release bodies.</li>
			<li><strong>Clean UI</strong> – built with shadcn‑svelte for accessibility and speed.</li>
		</ul>

		<h2 class="text-2xl font-semibold mt-6 mb-3">How It Works</h2>
		<p class="mb-4">
			RepoScoop fetches release data from the GitHub API and uses a smart algorithm to detect package names
			from release titles. It then groups releases by package name and displays them in a clean, organized interface.
		</p>
	</div>
</div>
