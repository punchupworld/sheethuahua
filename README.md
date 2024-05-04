# Sheethuahua

Type-safe Google Sheets and CSV parser for TypeScript and JavaScript

## Quick Start

Install the package

```bash
npm i sheethuahua
```

Using with public Google Sheets

```ts
import { Column, Spreadsheet, Table } from 'sheethuahua';

// Define named table(s) schema
const userTable = Table('users', {
	name: Column.String(),
	age: Column.Number(),
});

// Define a Spreadsheet
const sheets = Spreadsheet('<google-sheets-id>', [userTable]);

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
} from 'sheethuahua';

// Define anonymous table schema
const userTable = Table({
	name: Column.String(),
	age: Column.Number(),
});

// Get type-safe data from the URL
const users = await parseCSVFromUrl('some-url-to/data.csv');
// Or from string
const users = parseCSVFromString('name,age\na,27');

// Can also infer row type from the table schema
type User = RowType<typeof userTable>;
```
