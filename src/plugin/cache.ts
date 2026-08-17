import type { StaticDecode } from '@sinclair/typebox';
import type { TCsvSchema } from '../parser/parse-csv';
import type { SheetOptions, TSpreadsheet } from '../parser/spreadsheet';

/**
 * Maybe a promise, or maybe not
 */
export type TMaybePromise<T> = T | Promise<T>;

/**
 * Cache adapter for caching plugins
 */
export interface TCacheAdapter {
	/**
	 * Cache getter function
	 * @param key - The key to store the parsed value (table name)
	 * @returns The corresponded parsed table rows value
	 */
	get: (key: string) => TMaybePromise<unknown | undefined>;
	/**
	 * Cache setter function
	 * @param key - The key to store the value under (table name)
	 * @param value - The paired value to store (parsed rows value)
	 */
	set: (key: string, value: unknown) => TMaybePromise<any>;
}

/**
 * Options for with cache plugin
 */
export interface WithCacheOptions {
	/**
	 * Enable debugging logs
	 * @defaultValue false
	 */
	debug?: boolean;
}

/**
 * Add caching capability to the spreadsheet object.
 * @param spreadsheet - A spreadsheet object
 * @param cache - A cache adapter
 * @returns A spreadsheet object with underlying caching
 * @remarks The cache key is derived from the spreadsheet id, sheet name,
 * effective range and headers options, and a schema fingerprint, so one cache
 * adapter can safely be shared across spreadsheets and schemas.
 * @example
 * ```ts
 * const cache = new Map(); // Use Map as a simple in-memory cache
 * const sheets = withCache(Spreadsheet('google-sheets-id'), cache);
 * const output = sheets.get('sheet-name')
 * ```
 */
export function withCache<C extends TCacheAdapter>(
	spreadsheet: TSpreadsheet,
	cache: C,
	options: WithCacheOptions = {},
): TSpreadsheet {
	const cacheDebug = options?.debug;

	return {
		...spreadsheet,
		async get<S extends TCsvSchema>(
			sheet: string,
			schema: S,
			options: SheetOptions = {},
		) {
			const { range, headers } = { ...spreadsheet.globalOptions, ...options };

			const cacheKey = [
				spreadsheet.id,
				sheet,
				range,
				headers,
				hashSchema(schema),
			].join('|');

			const cachedValue = (await cache.get(cacheKey)) as
				| StaticDecode<S>[]
				| undefined;

			if (cacheDebug) {
				console.debug(
					`Cache ${cachedValue ? 'HIT' : 'MISS'} (Key = ${cacheKey})`,
				);
			}

			if (cachedValue) {
				return cachedValue;
			}

			const newValue = await spreadsheet.get(sheet, schema, options);

			await cache.set(cacheKey, newValue);

			return newValue;
		},
	};
}

/**
 * Derive a short stable fingerprint from a schema with the FNV-1a hash,
 * so that the same sheet parsed with different schemas is cached separately.
 * @param schema - The schema to fingerprint
 * @returns A base-36 hash string
 */
function hashSchema(schema: TCsvSchema): string {
	const str = JSON.stringify(schema);
	let hash = 0x811c9dc5;

	for (let i = 0; i < str.length; i++) {
		hash ^= str.charCodeAt(i);
		hash = Math.imul(hash, 0x01000193);
	}

	return (hash >>> 0).toString(36);
}
