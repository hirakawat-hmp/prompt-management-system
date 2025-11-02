# Suggested Commands

## Development Commands

### Start Development Server
```bash
npm run dev
```
Starts the Next.js development server on http://localhost:3000 with hot module reloading.

### Build for Production
```bash
npm run build
```
Creates an optimized production build of the application.

### Start Production Server
```bash
npm run start
```
Starts the production server (requires `npm run build` first).

### Run Linter
```bash
npm run lint
```
Runs ESLint to check code quality and style issues.

## Storybook Commands

### Start Storybook
```bash
npm run storybook
```
Starts the Storybook development server on http://localhost:6006 for component development and documentation.

### Build Storybook
```bash
npm run build-storybook
```
Creates a static build of Storybook in the `storybook-static` directory for deployment.

## Environment Setup

### Create Environment File
```bash
cp .env.example .env
```
Then edit `.env` and add your Google Generative AI API key:
```
GOOGLE_GENERATIVE_AI_API_KEY=your-actual-api-key
```

## Package Management

### Install Dependencies
```bash
npm install
```

### Add New Package
```bash
npm install <package-name>
```

### Add Dev Dependency
```bash
npm install --save-dev <package-name>
```

## Testing Commands

### Run Component Tests (Vitest)
```bash
npx vitest
```
Runs component tests in browser mode with Playwright.

### Run Tests with Coverage
```bash
npx vitest --coverage
```
Generates test coverage report using V8 provider.

## System Commands (Linux)
- `ls` - List directory contents
- `cd` - Change directory
- `grep` - Search text patterns
- `find` - Find files
- `git` - Version control operations
- `cat` - Display file contents
- `mkdir` - Create directories
- `rm` - Remove files/directories
