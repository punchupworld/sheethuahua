# Transformer

Every cell in CSV/Sheets is natively `string`. Transformer contain instructions about how to convert a string of each cell to be the data you want (decode) and convert it back (encode). `Column()` require a transformer in the 2nd argument.

For example, parse 'Count' column as a number:

```ts
Column('Count', asNumber());
```

> Sheethuahua's Transformer are built on top of [TypeBox's Type Transform](https://github.com/sinclairzx81/typebox?tab=readme-ov-file#types-transform)

## Built-In

Sheethuahua provide following transformers:

| Transformers                                          | Decode Output Type                   | Input Example |
| ----------------------------------------------------- | ------------------------------------ | ------------- |
| [`asString()`](/references/functions/asString.html)   | `string`                             | Text          |
| [`asNumber()`](/references/functions/asNumber.html)   | `number`                             | Number        |
| [`asBoolean()`](/references/functions/asBoolean.html) | `boolean`                            | Checkbox      |
| [`asDate()`](/references/functions/asDate.html)       | `Date`                               | Date          |
| [`asOneOf()`](/references/functions/asOneOf.html)     | Union type of given `Literal` values | Dropdown      |

Built-in transformers accept _options_ for further decode's output validation.

```ts
Column('Count', asNumber({ minimum: 0, maximum: 10 }));
```

See more about he _options_ in each transformer's reference.

## DIY

You can create your own transformer with [`createTransformer()`](/references/functions/createTransformer.html)

```ts{3-9}
import { createTransformer, Column, type StaticDecode } from 'sheethuahua';

const asStringList = (sep: string) =>
	createTransformer(
		// Decode function: string -> string[]
		(str) => str.split(sep),
		// Encode function: string[] -> string
		(items) => items.join(sep),
	);

const schema = Column('Items', asStringList(','));

// type Items: string[]
type Items = StaticDecode<typeof schema>;
```

::: tip
[TypeBox's Type](https://github.com/sinclairzx81/typebox?tab=readme-ov-file#types) can be supplied to the [`createTransformer()`](/references/functions/createTransformer.html) 3rd argument to validate the decode output.
:::

## Optional Variant

Transformer required value by default. If the column can be left empty you can call `.optional()` variant of the transformer. An empty cell will be parsed as `undefined` instead of throwing an error.

```ts{3}
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
