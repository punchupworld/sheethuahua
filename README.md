# Sheethuahua

Type-safe CSV and Google Sheets parser for TypeScript and JavaScript

![Sheethuahua](https://punchupworld.github.io/sheethuahua/sheethuahua.webp)

Using [TypeBox](https://github.com/sinclairzx81/typebox), [d3-dsv](https://d3js.org/d3-dsv), [Web Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) (and [Tempo](https://tempo.formkit.com) for date transformer) under the hood, Sheethuahua should be supported by every modern browsers and back-end runtime.

[![NPM Version](https://img.shields.io/npm/v/sheethuahua)](https://www.npmjs.com/package/sheethuahua)

[📖 View full documentation](punchupworld.github.io/sheethuahua/)

**1. Adopt our little doggo**

```bash
npm i sheethuahua
```

**2. Map CSV and JS data structure**

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

**3. And confidently parse it**

```ts
import { parseCsv, fetchCsv, Spreadsheet } from 'sheethuahua';

// const output: {
//     id: number;
//     name: string;
//     contact: {
//         email?: string | undefined;
//         phone: string;
//     };
// }[]
const output = parseCsv('some,csv,string', schema);

// or from URL
const output = await fetchCsv('https://url-to-csv', schema);

// or from Google Sheets
const sheets = Spreadsheet('google-sheets-id');
const output = await sheets.get('Sheet1', schema);
```

**4. In case you need to format the data back**

```ts
import { formatToCsv } from 'sheethuahua';

const csvString = formatToCsv(output, schema);
```

Released under the MIT License - Copyright © 2024-present Punch Up
