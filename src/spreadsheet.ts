import {
	Type,
	TypeGuard,
	type Intersect,
	type Static,
	type TIndexFromPropertyKey,
	type TKeyOf,
} from '@sinclair/typebox';
import { parseCSVFromUrl, type CSVFetcherOptions } from './parser';
import type { TNamedTable } from './table';

export function Spreadsheet<T extends TNamedTable<any, any>[]>(
	sheetsId: string,
	tables: [...T],
	globalOptions: CSVFetcherOptions = {},
) {
	const tablesSchema = Type.Intersect(tables);

	return {
		async get<N extends Static<TKeyOf<typeof tablesSchema>>>(
			tableName: N,
			options: CSVFetcherOptions = {},
		): Promise<Static<TIndexFromPropertyKey<Intersect<T>, N>>[]> {
			const columnsSchema = Type.Index(tablesSchema, [tableName]);

			if (TypeGuard.IsNever(columnsSchema)) {
				throw Error(
					`Table "${tableName}" is not defined when calling Spreadsheet function`,
				);
			}

			try {
				const res = await parseCSVFromUrl(
					`https://docs.google.com/spreadsheets/d/${sheetsId}/gviz/tq?tqx=out:csv&sheet=${tableName}`,
					columnsSchema,
					{ ...globalOptions, ...options },
				);

				return res;
			} catch (e) {
				throw Error(
					`Could not get "${tableName}" table. ${e instanceof Error ? e.message : ''}`.trim(),
				);
			}
		},
	};
}
