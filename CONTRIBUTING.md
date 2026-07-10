# Contributing to StockPilot Pro

First off, thank you for considering contributing to StockPilot Pro! It's people like you that make it a premium inventory management platform.

To maintain our code quality and ensure a smooth review process, please follow these guidelines.

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md).

## How Can I Contribute?

### Reporting Bugs

Before submitting a bug report:
1. Check the [Changelog](CHANGELOG.md) and existing issues to see if it has already been resolved or reported.
2. Ensure the bug is reproducible with the latest codebase.

When filing an issue, please use the Bug Report template and include:
* A clear, descriptive title.
* Steps to reproduce the behavior.
* Expected vs. actual results.
* Environment details (Node.js version, browser, OS).

### Suggesting Enhancements

We are always looking to improve! If you have a feature suggestion:
1. Explain the use case and why it would benefit most users.
2. Outline a potential implementation if you have one.
3. Use the Feature Request issue template.

### Pull Requests

We welcome pull requests! To help us merge your changes quickly:

1. **Fork the repo** and create your branch from `main`.
2. If you've added code that should be tested, **add tests**.
3. Ensure the test suite and typechecks pass (`npm run build` or `npx tsc --noEmit`).
4. Format your code using Prettier.
5. Use clear, descriptive commit messages matching the conventional commit standard:
   * `feat: add AI automatic product categorizer`
   * `fix: resolve auth redirect loop on session timeout`
   * `docs: update setup instructions in README`
6. Submit a PR using our Pull Request template.

## Coding Style & Best Practices

* **TypeScript**: Use strict type definitions. Avoid using `any` at all costs. Prefer interfaces over inline type assertions.
* **Tailwind CSS**: Keep classes organized and utilize our customized premium utility classes (e.g., `.glass-card`, `.card-premium`).
* **Components**: Use Radix UI/Base UI primitives as a foundation for accessible, keyboard-navigable, and screen-reader friendly elements.
* **React Hooks**: Make use of `useCallback` and `useMemo` where performance bottlenecks might occur (e.g., on large lists/charts).
* **Database**: Always use Prisma Client safely. Keep migrations clean and generated schemas up to date.

Thank you for your contribution!
