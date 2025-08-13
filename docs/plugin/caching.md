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
