---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: 'Sheethuahua'
  text: Type-safe CSV and Sheets parser
  tagline: Designed for TypeScript and JavaScript
  image: /sheethuahua.webp
  actions:
    - theme: brand
      text: Getting Started
      link: /guide/1-getting-started
    - theme: alt
      text: Learn more
      link: /introduction

features:
  - title: Schema Validation
    details: The CSV you want is what you want, no surprise.
  - title: Type Inferred
    details: Never forget what your parsed data look like.
  - title: Custom Transformation
    details: Got your own rules? Write a function and parse CSV as you needed.
---

<br/>

### 1. Adopt our little doggo

```bash
npm i sheethuaha
```

### 2. Describe what you want

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

### 3. And confidently get it

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
