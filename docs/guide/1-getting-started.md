---
description: Installation instructions for the sheethuahua npm package (npm, yarn, pnpm, bun) and example imports of core functions.
---

# Getting Started

Sheethuahua is available on [NPM](https://www.npmjs.com/package/sheethuahua) package repository.

![NPM Version](https://img.shields.io/npm/v/sheethuahua)

::: code-group

```bash [npm]
npm i sheethuahua

```

```bash [yarn]
yarn add sheethuahua

```

```bash [pnpm]
pnpm add sheethuahua

```

```bash [bun]
bun add sheethuahua

```

:::

The package provide functions _(schemas, transformers, parsers, and formatters)_ that can be imported as needed.

```ts
import {
	Column,
	Object,
	Spreadsheet,
	Tuple,
	asNumber,
	asString,
	// ...
} from 'sheethuahua';
```

## For AI Agents

- [LLM texts](/llms.txt) — full API reference for LLM context
- [sheethuahua-schema](https://github.com/punchupworld/sheethuahua/blob/main/skills/sheethuahua-schema/SKILL.md) skill — generate schemas from CSV/Sheets automatically:
  ```bash
  npx skills add punchupworld/sheethuahua
  ```
