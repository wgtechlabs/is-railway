# Contributing to is-railway

Thank you for your interest in contributing to `is-railway`! This guide will help you get started.

## Development Setup

This project uses **pnpm** as the package manager. Please ensure you have it installed:

```bash
# Install pnpm globally if you haven't already
npm install -g pnpm

# Or using corepack (Node.js 16.10+)
corepack enable
```

### Getting Started

1. **Fork and clone the repository**

   ```bash
   git clone https://github.com/your-username/is-railway.git
   cd is-railway
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

   > **Note**: The project enforces pnpm usage with a preinstall script. Using npm or yarn will show an error.

3. **Build the project**

   ```bash
   pnpm build
   ```

4. **Run tests**

   ```bash
   pnpm test
   ```

5. **Start development mode**

   ```bash
   pnpm dev
   ```

## Development Scripts

- `pnpm build` - Compile TypeScript to JavaScript
- `pnpm dev` - Watch mode for development
- `pnpm test` - Run all tests
- `pnpm test:watch` - Run tests in watch mode
- `pnpm lint` - Run ESLint
- `pnpm clean` - Clean build artifacts

## Project Structure

```text
is-railway/
├── src/
│   ├── index.ts          # Main exports and functionality
│   └── types.ts          # TypeScript type definitions
├── tests/
│   └── index.test.ts     # Unit tests
├── dist/                 # Compiled output (generated)
└── package.json          # Package configuration
```

## Making Changes

1. **Create a feature branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Follow the existing code style
   - Add tests for new functionality
   - Update documentation if needed

3. **Test your changes**

   ```bash
   pnpm test
   pnpm lint
   pnpm build
   ```

4. **Commit and push**

   ```bash
   git add .
   git commit -m "feat: add your feature description"
   git push origin feature/your-feature-name
   ```

5. **Create a Pull Request**

## Code Style

- Use TypeScript strict mode
- Follow existing naming conventions
- Add JSDoc comments for public APIs
- Keep functions small and focused
- Write comprehensive tests

## Testing

- Add tests for all new functionality
- Ensure existing tests continue to pass
- Use descriptive test names
- Test both success and error cases

## Pull Request Guidelines

- Provide a clear description of changes
- Include tests for new features
- Update documentation if needed
- Ensure all checks pass
- Keep changes focused and atomic

## Questions?

Feel free to open an issue for any questions or suggestions!