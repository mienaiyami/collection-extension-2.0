# Contributing to Collections Extension

Thank you for your interest in contributing to the Collections Extension! This guide will help you get started with contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)
- [Release Process](#release-process)
- [Getting Help](#getting-help)

## Code of Conduct

By participating in this project, you are expected to uphold our Code of Conduct. Please be respectful and considerate to other contributors.

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (version 18 or higher)
- **pnpm** (preferred package manager)
- **Git**
- A modern browser (Chrome, Firefox, or Edge) for testing

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:

   ```bash
   git clone https://github.com/mienaiyami/collection-extension-2.0.git
   cd collection-extension-2.0
   ```

## Development Setup

### Install Dependencies

```bash
# Install project dependencies
pnpm install
```

### Available Scripts

- `pnpm dev` - Start development server with hot reloading
- `pnpm build` - Build the extension for production
- `pnpm build:zip` - Build and create a zip file for distribution
- `pnpm lint` - Run ESLint to check code quality
- `pnpm tslint` - Run TypeScript compiler check
- `pnpm release` - Build and prepare for release (maintainers only)

### Load Extension for Development

#### Chrome/Chromium Browsers

1. Run `pnpm build` or `pnpm dev`
2. Open `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked"
5. Select the `/dist` folder

#### Firefox

1. Run `pnpm build`
2. Open `about:debugging`
3. Click "This Firefox"
4. Click "Load Temporary Add-on"
5. Select `/dist/manifest.json`

## Making Changes

### Before You Start

1. Check existing issues and pull requests to avoid duplicates
2. Create an issue to discuss major changes before implementing
3. Ensure your changes align with the project's goals

### Development Workflow

1. Create a new branch for your feature/fix:

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes following the guidelines above
3. Test your changes thoroughly
4. Commit your changes with clear, descriptive messages:

   ```bash
   git commit -m "feat: add new collection sorting feature"
   ```

## Testing

### Manual Testing

1. Build the extension: `pnpm build`
2. Load it in your browser (see Development Setup)
3. Test the following scenarios:
   - Creating and managing collections
   - Adding/removing tabs from collections
   - Keyboard shortcuts functionality
   - Import/export features
   - Sync functionality (if applicable)
   - Different browser environments

### Code Quality

Before submitting:

```bash
# Check TypeScript compilation
pnpm tslint

# Run linting
pnpm lint

# Build to ensure no build errors
pnpm build
```

## Submitting Changes

### Pull Request Process

1. Ensure your code follows all guidelines above
2. Update documentation if needed
3. Create a pull request with:
   - Clear title and description
   - Reference any related issues
   - Include screenshots for UI changes
   - List any breaking changes

## Release Process

The release process is handled by maintainers and includes:

1. Version bump in `package.json`
2. Automated building and packaging
3. Publishing to browser stores:
   - Chrome Web Store
   - Firefox Add-ons
4. Creating GitHub releases

## Getting Help

- **Issues**: Create an issue for bugs or feature requests
- **Discussions**: Use GitHub Discussions for questions
- **Documentation**: Check existing docs in `/docs` folder

### Reporting Bugs

When reporting bugs, include:

- Browser and version
- Extension version
- Steps to reproduce
- Expected vs actual behavior
- Screenshots/videos if applicable

### Suggesting Features

When suggesting features:

- Check if it already exists in the TODO list
- Explain the use case and benefits
- Consider implementation complexity
- Provide mockups or examples if helpful

## Thank You

Your contributions help make Collections Extension better for everyone. We appreciate your time and effort in improving this project!
