# Contributing to ProFlow 🤝

We would love for you to contribute to ProFlow and help make it even better! As a contributor, here are the guidelines we would like you to follow:

## 🌿 Branching Strategy

We follow a simplified version of Git Flow.

- **`main`**: The stable, production-ready branch. Do NOT commit directly to `main`.
- **`develop`**: The main development branch. All feature branches branch off from here and merge back here.
- **`feature/your-feature-name`**: Create a branch off `develop` for your new features.
- **`fix/your-bugfix-name`**: Create a branch off `develop` for bug fixes.

## 📝 Commit Message Convention

We strictly follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/). This leads to more readable messages that are easy to follow when looking through the project history.

### Format
```
<type>(<scope>): <subject>
```

### Types
- **`feat`**: A new feature
- **`fix`**: A bug fix
- **`docs`**: Documentation only changes
- **`style`**: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
- **`refactor`**: A code change that neither fixes a bug nor adds a feature
- **`perf`**: A code change that improves performance
- **`test`**: Adding missing or correcting existing tests
- **`chore`**: Changes to the build process or auxiliary tools and libraries

### Example
```
feat(frontend): add real-time WebSocket sync for Kanban board
fix(backend): resolve cache invalidation bug on column delete
style(api): format routes file using Laravel Pint
```

## 🛠️ Development Workflow

1. **Fork** the repository and clone it locally.
2. **Checkout** the `develop` branch: `git checkout develop`.
3. **Create a new branch**: `git checkout -b feature/awesome-new-feature`.
4. **Make your changes** following the coding standards.
   - For backend: Ensure your code passes Laravel Pint (`./vendor/bin/pint`).
   - For frontend: Ensure your code has no TypeScript errors and follows the ESLint configuration.
5. **Write Tests**: If you are adding a new feature or fixing a bug, please add corresponding tests in Pest PHP.
6. **Commit** your changes using Conventional Commits.
7. **Push** to your fork and submit a **Pull Request** against the `develop` branch of the main repository.

## ⚖️ Code of Conduct
Please be respectful and constructive in all discussions, pull requests, and issues. We aim to foster a welcoming and collaborative environment.

Thank you for contributing! 🎉
