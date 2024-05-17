# Sheethuahua

Type-safe Google Sheets and CSV parser for TypeScript and JavaScript

![Sheethuahua](https://repository-images.githubusercontent.com/791789277/007ab2a1-59bd-4f56-bd1d-3d52ceb67c3b)

Using [TypeBox](https://github.com/sinclairzx81/typebox), [d3-dsv](https://d3js.org/d3-dsv) and [Web Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) under the hood, Sheethuahua should be supported by every modern browsers and back-end runtime.

[![NPM Version](https://img.shields.io/npm/v/sheethuahua)](https://www.npmjs.com/package/sheethuahua)

**Table of contents**

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Quick Start](#quick-start)
- [Concepts](#concepts)
- [Define Table and Column](#define-table-and-column)
- [Using with Public Google Sheets](#using-with-public-google-sheets)
- [Using with a CSV File](#using-with-a-csv-file)
- [Options](#options)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Quick Start

Install the package

```bash
npm i sheethuahua
```

Using with a public Google Sheets

```ts
import { Column, Spreadsheet, Table, type RowType } from 'sheethuahua';

// Define named table(s) schema
const userTable = Table('users', {
	name: Column.String(),
	age: Column.Number(),
	role: Column.OneOf(['Admin', 'Guest']),
});

// Define a Spreadsheet
const sheets = Spreadsheet('<sheetsId>', [userTable]);

// Get type-safe data from the table
const users = await sheets.get('users');

// Infer row type from the table schema
type User = RowType<typeof userTable>;
```

Using with URL or string of a CSV file

```ts
import {
	Column,
	parseCSVFromUrl,
	parseCSVFromString,
	Table,
	type RowType,
} from 'sheethuahua';

// Define anonymous table schema
const userTable = Table({
	name: Column.String(),
	age: Column.Number(),
	role: Column.OneOf(['Admin', 'Guest']),
});

// Get type-safe data from the URL
const usersFromUrl = await parseCSVFromUrl('some-url-to/data.csv', userTable);
// Or from string
const usersFromString = await parseCSVFromString('name,age\na,27', userTable);

// Can also infer row type from the table schema
type User = RowType<typeof userTable>;
```

## Concepts

Sheethuahua was designed to make an unknown Spreadsheet or CSV data structure become known with 2 steps:

1. Define what kind of data structure we expected (the schema).
2. Try to parse it as an array of objects, and raise an error if it is not what we expected.

The basic data structure of both Spreadsheet and CSV is the `Table` which contains one or more `Column`s (Google Sheets's "Sheets" and "Sheet" are referred to as Sheethuahua's `Spreadsheet` and `Table`). `Table` can be either named or anonymous. A CSV represents exactly one `AnonymousTable`, while a `Spreadsheet` can contain one or more `NamedTable`.

An empty `Table` would have one header row defining each `Column`'s name, and then each body row after that would represent one record of data.

## Define Table and Column

We can define a table using `Table` and `Column`.

```ts
const userTable = Table('users', {
	name: Column.String(),
	age: Column.Number(),
	role: Column.OneOf(['Admin', 'Guest']),
});
```

From the example, we expect a table name "users" to have "name", "age", and "role" columns with coresponded type. Table name can be omitted to create `AnonymousTable` (Otherwise, `NamedTable` is created).

Every cell in a spreadsheet and CSV is a string by default. Sheethuahua will try to parse it into the expected `Column` type as defined in the `Table`. The following `Column` types are supported:

- **Required column type**: can't be empty.
  - `String()` expects anything except an empty string.
  - `Number()` expects any number including minus and decimal.
  - `Boolean()` expects case-insensitive true/false, or 0/1 _(For Google Sheets, recommend using Checkbox)_.
  - `Date()` expect [JavaScript's date time string format](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date#date_time_string_format) eg. YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss.sssZ.
  - `OneOf(values: TLiteralValue[])` expects one of the literal values (string, number, or boolean) in the given array. _(For Google Sheets, recommend using Dropdown)_.
- **Optional column type**: can be empty, parsed as `null`.
  - Same as a required column with an `Optional` prefix eg. `OptionalString()`.

[TypeBox's schema options](https://github.com/sinclairzx81/typebox?tab=readme-ov-file#types-options) can be passed to the `String`, `Number`, `Boolean`, `Date` and their optional variations.

The body row type can be inferred from the `Table` schema using `RowType`.

```ts
// type User = {
//     name: string;
//     age: number;
//     role: "Admin" | "Guest";
// }
type User = RowType<typeof userTable>;
```

## Using with Public Google Sheets

**Important:** Google Sheets has [a very low rate limit for requesting data](https://developers.google.com/sheets/api/limits). It should be used with Static Site Generation (SSG), cache, or both.

A `Spreadsheet` can be defined with `sheetsId` (Can be found from the Sheets URL: `docs.google.com/spreadsheets/d/{sheetsId}/`) and one or more child `NamedTable`.

_Note: The table's name must match the Google Sheets Sheet's name._

```ts
const userTable = Table('users', {
  name: Column.String(),
  age: Column.Number(),
  role: Column.OneOf(['Admin', 'Guest']),
});
const groupTable = Table('groups' {
  // ...
});

const sheets = Spreadsheet('<sheetsId>', [userTable, groupTable]);
```

Spreadsheet's `.get()` is used to fetch and parse the data as an array of objects of defined `Column` type. An error will be thrown if the data can not be parsed as expected type.

```ts
// const users: {
//     name: string;
//     age: number;
//     role: "Admin" | "Guest";
// }[]
const users = await sheets.get('users');
// const groups: {
//     ...
// }[]
const groups = await sheets.get('groups');
```

`SheetOptions` can be supplied to the `Spreadsheet()` as spreadsheet-wide options, or `.get()` for just once.

_See more in [Options](#options)_

```ts
const sheets = Spreadsheet('<sheetsId>', [userTable, groupTable], {
	// SheetOptions
});

const users = await sheets.get('users', {
	// SheetOptions
});
```

## Using with a CSV File

Sheethuahua also supports any CSV file from either a URL or string by supplying `AnonymousTable` into the `parseCSVFromUrl()` or `parseCSVFromString()`. Returned data will have an array of objects of defined `Column` type. An error will be thrown if the data can not be parsed as expected type.

```ts
const userTable = Table({
	name: Column.String(),
	age: Column.Number(),
	role: Column.OneOf(['Admin', 'Guest']),
});

// const users: {
//     name: string;
//     age: number;
//     role: "Admin" | "Guest";
// }[]
const usersFromUrl = await parseCSVFromUrl('some-url-to/data.csv', userTable);
const usersFromString = await parseCSVFromString('name,age\na,27', userTable);
```

The `CSVFetcherOptions` can be supplied to the `parseCSVFromUrl()` and `CSVParserOptions` can be supplied to the `parseCSVFromString()`.

_See more in [Options](#options)_

```ts
const usersFromUrl = await parseCSVFromUrl('some-url-to/data.csv', {
	// CSVFetcherOptions
});

const usersFromString = await parseCSVFromString('name,age\na,27', {
	// CSVParserOptions
});
```

## Options

All options are optional but availability varies between each type.

| Name                  | `SheetOptions` | `CSVFetcherOptions` | `CSVParserOptions` |
| --------------------- | -------------- | ------------------- | ------------------ |
| range                 | ✅             | ❌                  | ❌                 |
| headers               | ✅             | ❌                  | ❌                 |
| fetchRequestInit      | ✅             | ✅                  | ❌                 |
| trim                  | ✅             | ✅                  | ✅                 |
| includeUnknownColumns | ✅             | ✅                  | ✅                 |

- `range?: string` - Which part of the sheet to use eg. "A1:B10" [(see more)](https://developers.google.com/chart/interactive/docs/spreadsheets#query-source-ranges)
- `headers?: number` - How many rows are header rows. If not specified, Google Sheets will guess from the header and body type. [(see more)](https://developers.google.com/chart/interactive/docs/spreadsheets#queryurlformat)
- `trim?: boolean` _(default: true)_ - Trim whitespaces of each cell before parsing.
- `includeUnknownColumns?: boolean` _(default: false)_ - Include columns that are not defined in the table.
