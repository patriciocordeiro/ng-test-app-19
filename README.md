# NgTestApp19

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.2.15.

## 🛠️ Quality Tools Setup

This project is configured with comprehensive code quality tools:

- **ESLint** - TypeScript/JavaScript linting
- **Prettier** - Code formatting
- **Husky** - Git hooks automation
- **Commitlint** - Conventional commit message enforcement
- **lint-staged** - Run linters on staged files

### Installation

After cloning, install dependencies:

```bash
npm install
```

The `prepare` script will automatically set up Husky git hooks.

### Available Scripts

#### Development

```bash
npm start          # Start development server (ng serve)
npm run build      # Build for production
npm test           # Run unit tests
npm run watch      # Build in watch mode
```

#### Code Quality

```bash
npm run lint       # Check TypeScript/JavaScript files
npm run lint:fix   # Auto-fix linting issues
npm run format     # Format all files with Prettier
npm run format:check # Check if files are formatted
```

#### Git Hooks (Automatic)

- **Pre-commit**: Runs `lint-staged` (ESLint + Prettier on staged files)
- **Commit-msg**: Validates commit messages follow [Conventional Commits](https://conventionalcommits.org/)

### Commit Message Format

This project enforces conventional commit messages:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

**Examples:**

```bash
git commit -m "feat: add user authentication"
git commit -m "fix(auth): resolve login validation issue"
git commit -m "docs: update README with setup instructions"
```

## Development server

To start a local development server, run:

```bash
npm start
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
npm run build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
npm test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Configuration Files

- `.eslintrc.cjs` - ESLint configuration
- `.prettierrc.js` - Prettier formatting rules
- `commitlint.config.cjs` - Commit message linting
- `.husky/` - Git hook scripts

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
