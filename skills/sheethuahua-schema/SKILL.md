---
name: sheethuahua-schema
description: Generate type-safe schemas for sheethuahua from CSV files, URLs, or Google Sheets. Use when the user wants to parse CSV/Sheets data with sheethuahua, needs help defining Column/Object schemas, choosing transformers, or creating custom transformers. Covers the full workflow -> verify installation, inspect data, infer types, propose schema, iterate with human, and write the schema file.
---

Generate type-safe schemas for [sheethuahua](https://punchupworld.github.io/sheethuahua/) from CSV files, URLs, or Google Sheets.

## Resources

Fetch and consult when needed:

- **Full API reference**: https://punchupworld.github.io/sheethuahua/llms.txt

Always check this URL for current transformer signatures, options, and types. Do not rely on memorized API details — sheethuahua API may change between versions.

## Core Concepts

- CSV cells are strings. Transformers decode string → typed value, encode back.
- Schema = `Object({ key: Column('Header Name', transformer) })` defines row shape.
- Column name must match CSV header **exactly** (case-sensitive).
- `Object` / `Tuple` can nest for structured output.
- Unreferenced columns are ignored.
- `.optional()` makes field nullable (empty cell → `undefined`).
- `.optional(fallback)` provides a default value when cell is empty.

## Workflow

Follow these steps in order:

### 1. Check Installation

Verify `sheethuahua` is installed in the project:

- Check `package.json` for `"sheethuahua"` in dependencies or devDependencies.
- Or check if `node_modules/sheethuahua` exists.

If not installed, determine the package manager from lock files (`bun.lock` → bun, `pnpm-lock.yaml` → pnpm, `yarn.lock` → yarn, else npm) and install:

```bash
npm i sheethuahua    # or pnpm add / yarn add / bun add
```

### 2. Fetch API Reference

Fetch https://punchupworld.github.io/sheethuahua/llms.txt and read the relevant sections. Use it for:

- Available transformers and their signatures
- Schema constructors (Object, Tuple, Column)
- Parser functions and options
- Type inference with StaticDecode

### 3. Receive Input

Ask the user for one of:

- **CSV file path** — local file in the project
- **CSV URL** — publicly accessible CSV endpoint
- **Google Sheets** — requires Sheets ID and sheet name. Optionally ask about:
- `range` — e.g. `"A1:D10"` or `"2:5"` (rows 2–5)
- `headers` — number of header rows (default: 1)

Extract the Sheets ID from URL if user provides full link: `docs.google.com/spreadsheets/d/{sheetsId}/`

### 4. Fetch and Read Data

Use available tools to retrieve the data:

**Local CSV:** Read the file directly.

**CSV URL:** Fetch the URL.

**Google Sheets:** Construct the CSV export URL and fetch it:

```
https://docs.google.com/spreadsheets/d/{sheetsId}/gviz/tq?sheet={sheetName}&tqx=out:csv&range=1:11
```

This samples the first 11 rows (1 header + 10 data rows). Always limit rows — sheets can be huge.

Adjust the range param as needed:

- If user specified a custom range, use that instead.
- If user specified `headers` count > 1, extend range accordingly (e.g. `headers=2` → `1:12`).
- Append `&headers={n}` only if user specified a non-default header count (default is 1).

### 5. Analyze Columns

For each column header, inspect sample values and infer:

| Observation                   | Likely Transformer    | Notes                              |
| ----------------------------- | --------------------- | ---------------------------------- |
| Text values                   | `asString()`          | Default choice                     |
| Numeric values (int/float)    | `asNumber()`          | Check for empty cells              |
| `true`/`false`, `0`/`1`       | `asBoolean()`         | Case-insensitive                   |
| Date-like strings             | `asDate()`            | Detect format pattern from samples |
| Fixed set of repeated values  | `asOneOf([...])`      | Collect distinct values            |
| Comma/newline-separated lists | `asArray(asString())` | Confirm separator with data        |

Also determine:

- **Optional fields**: If a column has empty cells in samples, mark as `.optional()` or `.optional(fallback)`.
- **Nesting**: If column headers share a prefix or logical group (e.g. `Contact Email`, `Contact Phone`), consider nested `Object`.
- **Date format**: If dates aren't ISO 8601, infer the Tempo format string from samples (e.g. `"DD/MM/YYYY"`, `"MMM D, YYYY"`).

### 6. Draft Schema

Build the proposed schema:

- Default to `Object({})` with camelCase JS key names derived from headers.
- If user requests tuple/array output, use `Tuple([...])` instead.
- Map each field: `Column('Exact Header Name', transformer)`.
- Apply `.optional()` where columns can be empty.
- Nest Objects/Tuples if columns form logical groups.
- Flag each mapping with a confidence level:
- **High confidence**: Clear type from data (numbers, booleans, ISO dates).
- **Low confidence**: Ambiguous data (could be string or enum, date format uncertain, optional vs required unclear).

### 7. Present to Human

Show the proposed schema to the user. For each field, explain:

- The chosen transformer and why
- Whether it's optional and why
- Confidence level — explicitly highlight **low-confidence** assumptions

Example output format:

```ts
const schema = Object({
	id: Column('ID', asNumber()), // ← High confidence: all numeric
	name: Column('Name', asString()), // ← High confidence: text
	status: Column('Status', asOneOf(['Active', 'Inactive'])), // ← ⚠️ Low confidence: only 2 values seen, may have more
	joinedAt: Column('Joined At', asDate({ format: 'DD/MM/YYYY' })), // ← ⚠️ Low confidence: format inferred from 3 samples
	email: Column('Email', asString().optional()), // ← Optional: empty in row 3
});
```

Ask: "Does this look correct? Any adjustments?"

### 8. Iterate

Adjust based on user feedback:

- Wrong transformer → swap it
- Missing optional → add `.optional()` or `.optional(fallback)`
- Wrong nesting → restructure Object
- Unrecognized columns → ask user what they represent

Repeat until user approves.

### 9. Write Schema File

Before writing, collect from user (ask if not already provided):

1. **File path** — where to write (e.g. `src/schemas/user.ts`)
2. **Schema name** — name for the exported const (e.g. `userSchema`) and type (e.g. `User`)

Write the file:

```ts
import { Column, Object, asString, asNumber, type StaticDecode } from 'sheethuahua';

export const <schemaName> = Object({
  // ... fields
});

export type <TypeName> = StaticDecode<typeof <schemaName>>;
```

## Edge Cases

- **Google Sheets access**: Must be publicly accessible (at least "anyone with link"). If fetch fails, remind user to check sharing settings.
- **Date formats**: Without explicit format, `asDate()` expects ISO 8601. For custom formats, use [Tempo format tokens](https://tempo.formkit.com/#format-tokens).
- **Array separator**: `asArray()` defaults to comma. Pass second arg for custom separator (e.g. `asArray(asString(), '|')`).
- **Empty required fields**: If a transformer fails on empty string, either make it `.optional()` or ensure the column is always populated.
