# Migration from ESLint/Prettier to Biome

This project has migrated from ESLint and Prettier to [Biome](https://biomejs.dev/), a fast and modern linter and formatter for JavaScript and TypeScript.

## Changes Made

1. Removed ESLint and Prettier dependencies:
   - Removed `eslint`, `eslint-config-prettier`, `eslint-plugin-svelte`, `prettier`, `prettier-plugin-svelte`, `prettier-plugin-tailwindcss`, and related packages
   - Removed configuration files: `eslint.config.js` and `.prettierrc`

2. Added Biome:
   - Added `@biomejs/biome` as a development dependency
   - Created `biome.json` configuration file

3. Updated npm scripts:
   - `format`: Changed from `prettier --write .` to `biome format --write .`
   - `lint`: Changed from `prettier --check . && eslint .` to `biome check .`
   - Added `lint:fix`: `biome check --write .` for automatic fixes

## Current Limitations

1. **Svelte Support**: Biome currently has limited support for Svelte files, especially with Svelte 5's new syntax like `$props()`. For this reason, Svelte files are excluded from Biome linting. When Biome improves its Svelte support, we can include these files again.

2. **Tailwind Integration**: Unlike Prettier with `prettier-plugin-tailwindcss`, Biome doesn't have built-in support for sorting Tailwind CSS classes. This functionality is lost in the migration.

## Usage

```bash
# Format code
bun run format

# Lint code
bun run lint

# Lint and automatically fix issues
bun run lint:fix
```

## Future Improvements

1. Re-enable Svelte file linting once Biome improves Svelte 5 support
2. Explore options for Tailwind CSS class sorting
3. Fine-tune Biome rules to better match the project's coding standards

## References

- [Biome Documentation](https://biomejs.dev/guides/getting-started/)
- [Biome Configuration](https://biomejs.dev/reference/configuration/)
