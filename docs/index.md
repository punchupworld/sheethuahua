---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: 'Sheethuahua'
  text: Type-safe CSV and Google Sheets Parser
  tagline: For TypeScript and JavaScript
  image: /sheethuahua.webp
  actions:
    - theme: brand
      text: Getting Started
      link: /guide/1-getting-started
    - theme: alt
      text: Learn More
      link: /introduction

features:
  - icon: 🔍
    title: Validate and Infer Type
    details: Define what you expect with a schema and never run into a surprise.
  - icon: 🛠️
    title: Custom Transformation
    details: Got your own rules? Write a function to transform CSV value as needed.
  - icon: 🔄
    title: Convert Back and Forth
    details: CSV to JavaScript data and vice versa, using the same schema.
---

<br/>

### 1. Adopt our little doggo

```bash
npm i sheethuaha
```

### 2. Map CSV and JS data structure

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

### 3. And confidently parse it

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
const sheets = Spreadsheet('google-sheets-id');
const output = await sheets.get('Sheet1', schema);
```

### 4. In case you need to format the data back

```ts
import { formatToCsv } from 'sheethuahua';

const csvString = formatToCsv(output, schema);
```
