# Formatter

Formatter is the opposite of parser: it validates and encodes JavaScript data back to the CSV string with the given _schema_. If validation has failed, the error will be thrown.

::: info
Parsing CSV to JavaScript data is many-to-one relationship: both 0 and 'false' will be parsed to `false` using `asBoolean`'s decoder. But formatting is one-one: `false` boolean will always be formatted to 'false' in CSV. So **formatter's CSV output might not be exactly the same with parser's CSV input**, even though it is equal when parsed back to be JavaScript data.
:::

## formatToCsv

[`formatToCsv()`](/references/functions/formatToCsv.html) format the array of data back to be the CSV string using encoder defined in the given schema.

```ts{13}
import { formatToCsv } from 'sheethuahua';

const schema = Object({
	id: Column('ID', asNumber()),
	name: Column('Name', asString()),
});

const data = [
	{ id: 1, name: 'Samoyed' },
	{ id: 2, name: 'Shiba' },
];

const output = formatToCsv(data, schema);
```

The output value will be:

```csv
ID,Name
1,Samoyed
2,Shiba
```
