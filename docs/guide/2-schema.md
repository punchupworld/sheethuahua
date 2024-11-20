# Schema

Schemas define how each row from CSV/Sheet will be transformed into.

Let's assume this table is the input CSV data:

| ID  | Name |
| --- | ---- |
| 1   | A    |
| 2   | B    |

## Column

[`Column()`](/references/functions/Column.html) map value from the column in the CSV/Sheets.

If we describe schema as:

```ts
import { Column, asString } from 'sheethuahua';

const schema = Column('Name', asString());
```

> In each row, I want a value from column _"Name"_ and parse is as a string.

Then we expect output to be like:

```ts
['A', 'B'];
```

## Object

[`Object()`](/references/functions/Object.html) define an object data structure.

If we describe schema as:

```ts
import { Column, Object, asNumber, asString } from 'sheethuahua';

const schema = Object({
	id: Column('ID', asNumber()),
	name: Column('Name', asString()),
});
```

Then we expect output to be like:

```ts
[
	{ id: 1, name: 'A' },
	{ id: 2, name: 'B' },
];
```

## Tuple

[`Tuple()`](/references/functions/Tuple.html) define an array of the exact set of items.

If we describe schema as:

```ts
import { Tuple, Object, asNumber, asString } from 'sheethuahua';

const schema = Tuple([
	id: Column('ID', asNumber()),
	name: Column('Name', asString()),
])
```

Then we expect output to be like:

```ts
[
	[1, 'A'],
	[2, 'B'],
];
```

## Nested

Both `Object` and `Tuple` can be nested.

```ts
import { Column, Object, Tuple, asNumber, asString } from 'sheethuahua';

const schema = Object({
	id: Column('ID', asNumber()),
	name: Column('Name', asString()),
	contact: Object({
		email: Column('Email Address', asString()),
		phone: Column('Phone Number', asString().optional()),
	}),
	links: Tuple([Column('Link 1', asString()), Column('Link 2', asString())]),
});
```

> [!NOTE]
> Any column in CSV that is not referenced in the schema will be ignored.

## Infer Type

Use [`StaticDecode`](/references/type-aliases/StaticDecode.html) to infer schema type

```ts
import { type StaticDecode } from 'sheethuahua';

// type Person: {
//     id: number;
//     name: string;
// }
type Person = StaticDecode<typeof schema>;
```
