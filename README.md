# Sheethuahua 🐶📝

Type-safe Google Sheets and CSV parser for TypeScript and JavaScript.

Using [TypeBox](https://github.com/sinclairzx81/typebox), [d3-dsv](https://d3js.org/d3-dsv) and [Web Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) under the hood, Sheethuahua should be supported by every modern browsers and back-end runtime.

**Table of contents**

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Quick Start](#quick-start)
- [Ideology and Terminology](#ideology-and-terminology)
- [Define Table and Column](#define-table-and-column)
- [Using with Google Sheets](#using-with-google-sheets)
- [Using with CSV file](#using-with-csv-file)
- [CSV Parser Options](#csv-parser-options)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Quick Start

Install the package

```bash
npm i sheethuahua
```

Using public Google Sheets

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

Using with URL or string of CSV file

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
const users = await parseCSVFromUrl('some-url-to/data.csv', userTable);
// Or from string
const users = parseCSVFromString('name,age\na,27', userTable);

// Can also infer row type from the table schema
type User = RowType<typeof userTable>;
```

## Ideology and Terminology

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

From the example, we expect a table name "users" to have 3 columns: "name" with `String` type, "age" with `Number` type, and "role" with one of "Admin" or "Guest" type. Table name can be omitted to create `AnonymousTable` (Otherwise, `NamedTable` is created).

Naturally, a spreadsheet and CSV don't include any explicit type (everything is string by default). Sheethuahua will try to parse it into the expected `Column` type as defined in the `Table`. The following `Column` types are supported:

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

## Using with Google Sheets

**Important:** Google Sheets has [a very low rate limit for requesting data](https://developers.google.com/sheets/api/limits). It should be used with Static Site Generation (SSG), cache, or both.

First, target Google Sheets **must be public** (anyone with the link has "Viewer" permission in the sharing option). Then a `Spreadsheet` can be defined by providing `sheetsId` (Can be found from the Sheets URL: `https://docs.google.com/spreadsheets/d/{sheetsId}/`) and one or more `NamedTable` it has. **The table's name must match the Google Sheets Sheet's name.**

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

To fetch and parse the data, we can use `.get(tableName: string)` method. Returned data will have an array of objects of defined `Column` type. An error will be thrown if the data can not be parsed as expected type.

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

[CSVParserOptions](#csv-parser-options) can be supplied as a last argument of `Spreadsheet` as spreadsheet-wide options, or a last argument of `.get` method for just once.

## Using with CSV file

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
const users = await parseCSVFromUrl('some-url-to/data.csv', userTable);
const users = parseCSVFromString('name,age\na,27', userTable);
```

[CSVParserOptions](#csv-parser-options) can be supplied as a last argument of both functions.

## CSV Parser Options

`CSVParserOptions` can be used to custom CSV parser behavior.

```ts
interface CSVParserOptions {
	trim?: boolean;
	includeUnknownColumns?: boolean;
	headerRowNumber?: number;
	firstBodyRowNumber?: number;
	lastBodyRowNumber?: number;
}
```

- **trim**: boolean (default: true) - trim white space in each cell before parsing
- **includeUnknownColumns**: boolean (default: false) - include columns that are not defined in the `Table`
- **headerRowNumber**: number (default: 1) - Row number of a header row
- **firstBodyRowNumber**: number (default: 2) - Row number of the first body row
- **lastBodyRowNumber**: number (default: undefined) - Row number of a last body row. If undefined, it will return from the first row body to the last row of source data.
