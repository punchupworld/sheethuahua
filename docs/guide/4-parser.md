# Parser

Parser validate and transform the input data from the given _data source_ and the _schema_. If validation has failed, the error will be thrown.

Let's use this schema as an example:

```ts
import { Column, Object, asNumber, asString } from 'sheethuahua';

const schema = Object({
	id: Column('ID', asNumber()),
	name: Column('Name', asString()),
});
```

## parseCsv

[`parseCsv()`](http://localhost:5173/references/functions/parseCsv.html) use CSV string as the data source.

```ts
import { parseCsv } from 'sheethuahua';

const input = 'ID,Name\n1,A\n2,B\n';

// const output: {
//     id: number;
//     name: string;
// }[]
const output = parseCsv(input, schema);
```

## fetchCsv

[`fetchCsv()`](http://localhost:5173/references/functions/fetchCsv.html) use URL to the CSV file as the data source.

```ts
import { fetchCsv } from 'sheethuahua';

// const output: {
//     id: number;
//     name: string;
// }[]
const output = await fetchCsv('https://url-to/data.csv', schema);
```

## Spreadsheets

[`Spreadsheets()`](http://localhost:5173/references/functions/Spreadsheets.html) use Google Sheets as a data source. Providing _Sheets ID_ and call `.get()` to parse the data from specific sheet's name and corresponded schema.

::: tip
_Sheets ID_ can be found from the Google Sheets URL: `https://docs.google.com/spreadsheets/d/{sheetsId}/`
:::

```ts
import { fetchCsv } from 'sheethuahua';

const sheets = Spreadsheet('google-sheets-id');

// const output: {
//     id: number;
//     name: string;
// }[]
const output = await sheets.get('SheetName', schema);
```

::: warning
Google Sheets has [a very low rate limit](https://developers.google.com/sheets/api/limits). It should be used with Static Site Generation (SSG), cache, or both.
:::