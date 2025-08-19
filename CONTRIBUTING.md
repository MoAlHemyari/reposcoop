# Contributing to RepoScoop

Thank you for your interest in contributing to RepoScoop! This document provides guidelines and instructions for contributing to this project.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for everyone.

## How to Contribute

### Reporting Bugs

If you find a bug, please create an issue with the following information:

1. A clear, descriptive title
2. Steps to reproduce the issue
3. Expected behavior
4. Actual behavior
5. Screenshots (if applicable)
6. Environment information (browser, OS, etc.)

### Suggesting Features

Feature suggestions are welcome! Please create an issue with:

1. A clear, descriptive title
2. Detailed description of the proposed feature
3. Any relevant examples or mockups
4. Explanation of why this feature would be useful

### Pull Requests

1. Fork the repository
2. Create a new branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests to ensure they pass
5. Commit your changes following the [Conventional Commits](https://www.conventionalcommits.org/) specification
6. Push to your branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## Development Workflow

### Setting Up the Development Environment

1. Clone your fork of the repository
2. Install dependencies with `bun install`
3. Start the development server with `bun run dev`

### Project Structure

```
reposcoop/
├── src/
│   ├── lib/            # Library code
│   │   ├── components/ # UI components
│   │   └── utils/      # Utility functions
│   ├── routes/         # SvelteKit routes
│   │   ├── about/      # About page
│   │   └── r/          # Repository view pages
│   └── app.css         # Global styles
└── static/             # Static assets
```

### Coding Standards

- Use TypeScript for type safety
- Follow the existing code style
- Use Svelte 5 runes syntax for reactivity
- Write tests for new features and bug fixes

### Testing

Before submitting a PR, make sure all tests pass:

```bash
# Run all tests
bun test

# Run only unit tests
bun run test:unit
```

### Commit Messages

Always commit after each task is finished to keep changes atomic and reviewable.

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

Types include:

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation changes
- `style`: Changes that do not affect the meaning of the code
- `refactor`: Code changes that neither fix a bug nor add a feature
- `perf`: Performance improvements
- `test`: Adding or correcting tests
- `chore`: Changes to the build process or auxiliary tools

Examples:

- `feat: add recently viewed repositories feature`
- `fix: correct repository URL validation`
- `docs: update README with new examples`

## License

By contributing to RepoScoop, you agree that your contributions will be licensed under the project's MIT License.
