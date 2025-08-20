# RepoScoop 📦🔍

_Skim GitHub release notes in a single glance._

RepoScoop solves the pain of navigating releases in large repositories—especially monorepos. Paste any GitHub repo URL and get an instant, collapsible view of each package’s versions alongside their release notes, grouped by package name for quick scanning.

## Features

1. **Single‑input workflow** – one textbox, one button.
2. **Smart grouping** – releases organized by detected package name.
3. **Collapsible drill‑down** – expand a package to see version tags and full release bodies.
4. **Clean UI** – built with daisyUI for modern, accessible components and consistent theming.
5. **Fast performance** – client-side processing with efficient caching.
6. **Mobile-friendly** – responsive design works on all devices.

## Demo

[Live Demo](https://reposcoop.pages.dev) (Coming soon)

Try it with these example repositories:

- [clerk/javascript](https://github.com/clerk/javascript) - Authentication library with multiple packages
- [vercel/next.js](https://github.com/vercel/next.js) - React framework with many releases
- [sveltejs/kit](https://github.com/sveltejs/kit) - Svelte application framework

## Getting Started

### Prerequisites

- Node.js 18.x or later
- bun (recommended), npm, pnpm, or yarn

### Installation

1. Clone the repository

   ```bash
   git clone https://github.com/aqeelat/reposcoop.git
   cd reposcoop
   ```

2. Install dependencies

   ```bash
   bun install
   # or
   npm install
   # or
   pnpm install
   # or
   yarn install
   ```

### Development

Start the development server:

```bash
bun run dev

# or start the server and open the app in a new browser tab
bun run dev -- --open
```

### Testing

RepoScoop uses Vitest for unit tests.

```bash
# Run all tests
bun test

# Run only unit tests
bun run test:unit
```

### Building for Production

Create a production build:

```bash
bun run build

# Preview the production build
bun run preview
```

## Deployment

RepoScoop is configured to deploy to Cloudflare Pages using the `@sveltejs/adapter-cloudflare` adapter. No additional configuration is needed for basic deployment.

## Project Structure

```
reposcoop/
├── src/
│   ├── lib/            # Library code
│   │   ├── components/ # UI components
│   │   └── utils/      # Utility functions
│   ├── routes/         # SvelteKit routes
│   │   └── r/          # Repository view pages
│   └── app.css         # Global styles
├── docs/
│   └── architecture/   # Architecture evaluations/ADRs
└── static/             # Static assets
```

## Architecture & ADRs

- GraphQL Evaluation: docs/architecture/graphql-evaluation.md

## How It Works

1. **Input**: User enters a GitHub repository URL
2. **Fetching**: Application fetches release data from GitHub API
3. **Processing**: Releases are grouped by package name using pattern detection
4. **Display**: Grouped releases are displayed in a collapsible interface

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
