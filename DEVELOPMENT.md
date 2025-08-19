# RepoScoop Development Guide

This document provides guidance for developers working on the RepoScoop project, with a focus on running the application in different environments.

## Running the Development Server

RepoScoop provides several options for running the development server to accommodate different use cases.

### Standard Development

For normal development work, use the standard development command:

```bash
bun run dev
```

This starts the Vite development server with hot module reloading. The server will continue running until you manually stop it (typically with Ctrl+C).

### Non-Blocking Options

When working in environments where a long-running process might be problematic (such as automated scripts or AI assistants), you can use one of these alternatives:

#### Time-Limited Development Server

To run the development server for a limited time (30 seconds by default):

```bash
bun run dev:timed
```

This command will automatically terminate the server after the specified timeout, making it useful for quick checks or automated testing.

#### Background Development Server

To run the development server in the background:

```bash
bun run dev:background
```

This starts the server as a background process, immediately returning control to the terminal. The server will continue running until you manually stop it using process management commands.

To find and stop the background server:

```bash
# Find the process ID
ps aux | grep vite

# Stop the server
kill <process_id>
```

### Production Preview

To preview the production build:

```bash
# Build the application first
bun run build

# Standard preview (blocks the terminal)
bun run preview

# Time-limited preview (stops after 30 seconds)
bun run preview:timed
```

## Testing

RepoScoop uses Vitest for unit tests.

```bash
# Run all tests
bun test

# Run only unit tests
bun run test:unit
```

## Code Quality

Maintain code quality with these commands:

```bash
# Check TypeScript types
bun run check

# Format code with Prettier
bun run format

# Lint code with ESLint
bun run lint
```

## Package Management

RepoScoop uses [Bun](https://bun.sh/) as the recommended package manager.

```bash
# Install dependencies
bun install

# Add a new dependency
bun add <package-name>

# Add a development dependency
bun add -d <package-name>
```

## Troubleshooting

### Development Server Issues

If the development server becomes unresponsive or you encounter other issues:

1. Stop any running servers (Ctrl+C or find and kill the process)
2. Clear any temporary files: `rm -rf .svelte-kit`
3. Reinstall dependencies: `bun install`
4. Restart the server: `bun run dev`

### Testing Issues

If tests are failing unexpectedly:

1. Make sure all dependencies are installed: `bun install`
2. Run tests with verbose output: `bun run test:unit -- --verbose`
