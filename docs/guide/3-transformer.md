---
description: Transformers that decode/encode CSV string cells into typed values — built-in transformers (asString, asNumber, asBoolean, asDate, asOneOf, asArray), custom transformers via createTransformer, and optional/fallback variants.
---

# Transformer

Every cell in CSV/Sheets is a `string`. Transformers contain instructions about how to convert a string of each cell to be the data you want (decode) and convert it back (encode). `Column()` requires a transformer in the 2nd argument.

For example, parse _"Count"_ column as a number:

```ts
Column('Count', asNumber());
```

> Transformers are built on top of [TypeBox's Type Transform](https://github.com/sinclairzx81/typebox?tab=readme-ov-file#types-transform)

## Built-In

Sheethuahua provide following transformers:

| Transformers                                                     | Decode Output Type                          | Input Example   |
| ---------------------------------------------------------------- | ------------------------------------------- | --------------- |
| [`asString()`](/references/functions/asString.html)              | `string`                                    | Text            |
| [`asNumber()`](/references/functions/asNumber.html)              | `number`                                    | Number          |
| [`asBoolean()`](/references/functions/asBoolean.html)            | `boolean`                                   | Checkbox        |
| [`asDate()`](/references/functions/asDate.html)                  | `Date`                                      | Date            |
| [`asOneOf(values)`](/references/functions/asOneOf.html)          | Union type of given `Literal` values        | Dropdown        |
| [`asArray(itemTransformer)`](/references/functions/asArray.html) | An array of sub-transformer's decode output | Splittable text |

Built-in transformers accept _options_ for further decodes output validation.

```ts
Column('Count', asNumber({ minimum: 0, maximum: 10 }));
```

See more about the _options_ in each transformer's reference.

### Date Format and Timezone

[`asDate()`](/references/functions/asDate.html) uses [Tempo](https://tempo.formkit.com) and expects [ISO 8601](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date#date_time_string_format) by default. Use the `format` option for anything else, and `timezone` (default UTC) to say which zone a bare date string is written in.

```ts
Column('CreatedAt', asDate());

Column(
	'CreatedAt',
	asDate({
		format: 'DD/MM/YYYY',
		timezone: 'Asia/Bangkok',
	}),
);
```

A date string without an explicit UTC offset is read as local time in `timezone`, while a string that already carries an offset (or the `Z` suffix) is respected as-is.

```ts
const transformer = asDate({ timezone: 'Asia/Bangkok' });

// Bangkok midnight, which is 17:00 UTC the previous day
Decode(transformer, '2024-01-01T00:00');

// Already explicit, so the offset wins
Decode(transformer, '2024-01-01T07:00:00.000+07:00');
```

When encoding without a custom `format`, the output is written in `timezone` with its matching UTC offset, so it decodes back to the same instant.

```ts
const date = new Date('2024-01-01T00:00:00.000Z');

// '2024-01-01T00:00:00.000Z'
Encode(asDate(), date);

// '2024-01-01T07:00:00.000+07:00'
Encode(asDate({ timezone: 'Asia/Bangkok' }), date);
```

## DIY

You can create your own transformer with [`createTransformer()`](/references/functions/createTransformer.html)

```ts{3-11}
import { createTransformer, Column, type StaticDecode } from 'sheethuahua';

const asMarkdownList = createTransformer({
	// Decode function: string -> string[]
	decode: (str) => str
		.split('\n')
		.map((line) => line.replace('- ', '').trim())
		.filter((item) => item.length > 0),
	// Encode function (Optional): string[] -> string
	encode: (items) => items.map(item => `- ${item}`).join('\n'),
});

const schema = Column('Items', asMarkdownList);

// type Items: string[]
type Items = StaticDecode<typeof schema>;
```

::: tip

- Encode function is optional. If it isn't provided, a function returning an empty string will be used. (When you don't plan to use the [formatter](5-formatter))
- A [TypeBox's Type](https://github.com/sinclairzx81/typebox?tab=readme-ov-file#types) can be supplied via the `validateSchema` option to validate the decode output and encode input.
  :::

## Optional Variant

Transformer required value by default and will throw when input is an empty string (or any value in `emptyValues` option). If the column can be left empty you can call `.optional()` variant of the transformer. An empty cell will be parsed as `undefined` and omitted from `Object` instead of throwing an error.

```ts{3,8}
const schema = Object({
	id: Column('ID', asNumber()),
	name: Column('Name', asString().optional()),
});

// type Person: {
//     id: number;
//     name?: string | undefined;
// }
type Person = StaticDecode<typeof schema>;
```

### Fallback

You can provide a fallback value when column is empty instead of `undefined`

```ts{3,8}
const schema = Object({
	id: Column('ID', asNumber()),
	name: Column('Name', asString().optional('anonymous')),
});

// type Person: {
//     id: number;
//     name: string; (will be 'anonymous' when the cell is empty)
// }
type Person = StaticDecode<typeof schema>;
```

## Custom Empty Values

By default, only the empty string `''` is treated as empty. You can override which values are treated as empty via the `emptyValues` option on any transformer:

```ts
// On non-optional column: throws "Received empty value 'N/A'…"
Column('Score', asNumber({ emptyValues: ['N/A', '-'] }));

// On optional column: returns undefined or fallback
Column('Score', asNumber({ emptyValues: ['N/A'] }).optional());
Column('Score', asNumber({ emptyValues: ['N/A'] }).optional(0));
```

- Matching is case-sensitive and exact.
- Empty values only checked at the cell level — `asArray` inner items do not inherit this check.
- Passing `emptyValues` replaces the default. Include `''` explicitly if you still want empty strings treated as empty: `emptyValues: ['', 'N/A']`.
