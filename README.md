<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

**Table of Contents** _generated with [DocToc](https://github.com/thlorenz/doctoc)_

- [Sheethuahua](#sheethuahua)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# Sheethuahua

Type-safe CSV and Google Sheets Parser for TypeScript and JavaScript

![Sheethuahua](https://punchupworld.github.io/sheethuahua/sheethuahua.webp)

Using [TypeBox](https://github.com/sinclairzx81/typebox), [d3-dsv](https://d3js.org/d3-dsv) and [Web Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) under the hood, Sheethuahua should be supported by every modern browsers and back-end runtime.

[![NPM Version](https://img.shields.io/npm/v/sheethuahua)](https://www.npmjs.com/package/sheethuahua)

[📖 View full documentation](punchupworld.github.io/sheethuahua/)

**1. Adopt our little doggo**

```bash
npm i sheethuaha
```

**2. Describe what you want**

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

**3. And confidently get it**

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

Released under the MIT License - Copyright © 2024-present Punch Up
