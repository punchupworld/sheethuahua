# Sheethuahua

Type-safe CSV and Google Sheets parser for TypeScript and JavaScript

![Sheethuahua](https://punchupworld.github.io/sheethuahua/sheethuahua.webp)

Using [TypeBox](https://github.com/sinclairzx81/typebox), [d3-dsv](https://d3js.org/d3-dsv), [Web Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) (and [Tempo](https://tempo.formkit.com) for date transformer) under the hood, Sheethuahua should be supported by every modern browsers and back-end runtime.

[![NPM Version](https://img.shields.io/npm/v/sheethuahua)](https://www.npmjs.com/package/sheethuahua)

[📖 View full documentation](https://punchupworld.github.io/sheethuahua/)

<!-- #region doc-index -->

## Quick Start 🪄

### 1. Adopt our little doggo

```bash
npm i sheethuahua
```

### 2. Define the schema

| ID  | Name    | Email Address  | Phone Number |
| --- | ------- | -------------- | ------------ |
| 1   | Samoyed | samo123@doggo  | 0800000000   |
| 2   | Shiba   | shibainu@doggo |              |

```ts
import { Column, Object, asNumber, asString } from 'sheethuahua';

const schema = Object({
	id: Column('ID', asNumber()),
	name: Column('Name', asString()),
	contact: Object({
		email: Column('Email Address', asString()),
		phone: Column('Phone Number', asString().optional()),
	}),
});
```

### 3. Parse the data

```ts
import { parseCsv, fetchCsv, Spreadsheet } from 'sheethuahua';

// const output: {
//     id: number;
//     name: string;
//     contact: {
//         email: string;
//         phone?: string | undefined;
//     };
// }[]
const output = parseCsv('some,csv,string', schema);
// or from URL
const output = await fetchCsv('https://url-to-csv', schema);
// or from Google Sheets
const output = await Spreadsheet('google-sheets-id').get('Sheet1', schema);

console.log(output);
```

```json
[
	{
		"id": 1,
		"name": "Samoyed",
		"contact": { "email": "samo123@doggo", "phone": "0800000000" }
	},
	{
		"id": 2,
		"name": "Shiba",
		"contact": { "email": "shibainu@doggo" }
	}
]
```

### 4. Format back to CSV if you need

```ts
import { formatToCsv } from 'sheethuahua';

const csvString = formatToCsv(output, schema);

console.log(csvString);
```

```csv
ID,Name,Email Address,Phone Number
1,Samoyed,samo123@doggo,0800000000
2,Shiba,shibainu@doggo,
```

<!-- #endregion doc-index -->

Released under the MIT License - Copyright © 2024-present Punch Up
