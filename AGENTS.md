# Sheethuahua

Type-safe CSV and Google Sheets parser for TypeScript and JavaScript

- Main tech stack are Typescript and Bun
- Always use Bun as the package manager
- Always name a file with kebab-case
- Always write JSDoc comment for every public interface, never write arbitrary comment
- Update or add corresponded unit tests in tests directory when business logic has changes
- After finishing any task, run the following commands:
  - Check type with `bun run check`
  - Lint with `bun run lint`, all errors and warnings must be fixed
  - Run test with `bun test`
  - Format code with `bun run format` before declaring task as done
- Human will get in the loop and may edit some file along the way. If you spot it, please respect those changes
