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
 * Add caching capability to the spreadsheet object.
 * @param spreadsheet - A spreadsheet object
 * @param cache - A cache adapter
 * @returns A spreadsheet object with underlying caching
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
): TSpreadsheet {
	return {
		async get<S extends TCsvSchema>(
			sheet: string,
			schema: S,
			options: SheetOptions = {},
		) {
			const { range, headers } = options;

			const cacheKey = [sheet, range, headers].join('|');

			const cachedValue = (await cache.get(cacheKey)) as
				| StaticDecode<S>[]
				| undefined;

			if (cachedValue) {
				return cachedValue;
			}

			const newValue = await spreadsheet.get(sheet, schema, options);

			cache.set(cacheKey, newValue);

			return newValue;
		},
	};
}
