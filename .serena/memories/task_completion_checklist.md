# Task Completion Checklist

When completing a development task in this project, ensure you follow this checklist:

## 1. Code Quality
- [ ] Run ESLint and fix any issues:
  ```bash
  npm run lint
  ```
- [ ] Ensure TypeScript strict mode compliance (no `any` types unless necessary)
- [ ] Follow the project's naming conventions (camelCase, PascalCase, kebab-case)
- [ ] Use path aliases (`@/*`) for imports within the project

## 2. Code Style
- [ ] Use 2-space indentation
- [ ] Use single quotes for strings
- [ ] Include semicolons
- [ ] Prefer named exports
- [ ] Use type inference where possible, explicit types where needed

## 3. Testing (when applicable)
- [ ] Test the functionality manually in development mode
- [ ] Verify the application builds successfully:
  ```bash
  npm run build
  ```

## 4. AI/Mastra Specific (if working with agents/workflows/tools)
- [ ] Ensure agent instructions are clear and well-documented
- [ ] Verify tool implementations follow Mastra conventions
- [ ] Check that memory/storage configurations are correct
- [ ] Test agent behavior with various inputs

## 5. React/Next.js Specific
- [ ] Components use function syntax (not class components)
- [ ] Tailwind CSS classes are used for styling
- [ ] Images use Next.js `<Image>` component
- [ ] Links use Next.js `<Link>` component where appropriate

## 6. Storybook (if working with UI components)
- [ ] Create story files (`.stories.tsx`) alongside components
- [ ] Include multiple story variants (default, variants, states)
- [ ] Add `tags: ['autodocs']` for automatic documentation
- [ ] Define proper argTypes for interactive controls
- [ ] Enable Next.js App Directory support: `nextjs: { appDirectory: true }`
- [ ] Test stories in Storybook UI:
  ```bash
  npm run storybook
  ```
- [ ] Verify accessibility (check a11y panel in Storybook)
- [ ] Ensure stories build successfully:
  ```bash
  npm run build-storybook
  ```

## 7. Environment and Configuration
- [ ] Update `.env.example` if new environment variables are added
- [ ] Document any new configuration requirements
- [ ] Verify API keys and credentials are not committed

## 8. Documentation
- [ ] Add comments for complex logic
- [ ] Update relevant documentation if architecture changes
- [ ] Ensure exported functions/components have clear names
- [ ] Update STORYBOOK.md if adding new Storybook patterns

## 9. Before Committing
- [ ] Run the development server and verify changes:
  ```bash
  npm run dev
  ```
- [ ] Check for console errors or warnings
- [ ] Run linter one final time:
  ```bash
  npm run lint
  ```
- [ ] Build passes without errors:
  ```bash
  npm run build
  ```

## Quick Command Reference
```bash
# Check everything before committing
npm run lint && npm run build

# Test UI components in Storybook
npm run storybook

# Build Storybook for deployment
npm run build-storybook
```
