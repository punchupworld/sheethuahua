# Caching

Caching generally making your application faster with the cost of some memory/storage, but it is even more important when using Sheethuahua with Google Sheets to avoid an issue with very low rate limiting.

## Spreadsheet Cache

Sheethuahua currently provide caching in the Spreadsheet level with [`withCache`](/references/functions/withCache.html). Every request to every `table` will go through the caching layer automatically.

[`withCache`](/references/functions/withCache.html) requires a [`CacheAdapter`](/references/interfaces/TCacheAdapter.html): an object containing `get` and `set` function to interact with the cache.

Example with native JavaScript's Map for a simple in-memory cache:

```ts
import { Spreadsheet, withCache } from 'sheethuahua';

const cache = new Map(); // Use Map as a simple in-memory cache
const sheets = withCache(Spreadsheet('google-sheets-id'), cache);

const output = sheets.get('sheet-name');
```

You can replace the map with [ioredis](https://www.npmjs.com/package/ioredis), [node-cache](https://github.com/node-cache/node-cache), etc. or even your own implementation of [`CacheAdapter`](/references/interfaces/TCacheAdapter.html).

## Cache Key

Each entry is keyed by everything that can change the parsed result:

- The Sheets ID of the spreadsheet
- The sheet name
- The effective `range` and `headers` options (global options merged with the ones given to `.get()`)
- A fingerprint of the schema

That means one cache adapter can safely be shared across multiple spreadsheets, and requesting the same sheet with a different schema, range, or headers will not return another request's rows.

```ts
const cache = new Map();

// Safe to share the same cache between both spreadsheets
const dogs = withCache(Spreadsheet('dogs-sheets-id'), cache);
const cats = withCache(Spreadsheet('cats-sheets-id'), cache);
```

::: warning
The key format is not part of the public API and may change between major versions. A persisted cache (Redis, files, etc.) will simply miss once per entry and refill after upgrading.
:::

## Error Handling

The `set` function is awaited, so if writing to the cache fails, the error is thrown from `.get()` and can be caught by the caller.

```ts
try {
	await sheets.get('sheet-name', schema);
} catch (e) {
	// Reaches here if fetching, parsing, or caching has failed
}
```
