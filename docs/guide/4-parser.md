# Parser

Parser validate and decode the input CSV from the given _data source_ and the _schema_. If validation has failed, the error will be thrown.

Let's use this schema as an example:

```ts
import { Column, Object, asNumber, asString } from 'sheethuahua';

const schema = Object({
	id: Column('ID', asNumber()),
	name: Column('Name', asString()),
});
```

## parseCsv

[`parseCsv()`](/references/functions/parseCsv.html) use CSV string as the data source.

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

[`fetchCsv()`](/references/functions/fetchCsv.html) use URL to the CSV file as the data source.

```ts
import { fetchCsv } from 'sheethuahua';

// const output: {
//     id: number;
//     name: string;
// }[]
const output = await fetchCsv('https://url-to/data.csv', schema);
```

## Spreadsheets

[`Spreadsheets()`](/references/functions/Spreadsheet.html) use Google Sheets as a data source. Providing _Sheets ID_ and call `.get()` to parse the data from specific sheet's name and corresponded schema.

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

1. The sheets must be publicly accessible (At least anyone with the link can view).
2. Google Sheets has [a very low rate limit](https://developers.google.com/sheets/api/limits). It should be used with Static Site Generation (SSG), cache, or both.

:::
