# RepoScoop 📦🔍
*Skim GitHub release notes in a single glance.*

RepoScoop solves the pain of navigating releases in large repositories—especially monorepos. Paste any GitHub repo URL and get an instant, collapsible view of each package’s versions alongside their release notes, grouped by package name for quick scanning.

## Core Idea

1. **Single‑input workflow** – one textbox, one button.
2. **Smart grouping** – releases organized by detected package name.
3. **Collapsible drill‑down** – expand a package to see version tags and full release bodies.
4. **Clean UI** – built with shadcn‑svelte for accessibility and speed.

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.
