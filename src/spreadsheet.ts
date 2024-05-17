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

interface SheetOptions extends CSVFetcherOptions {
	range?: string;
	headers?: number;
}

export function Spreadsheet<T extends TNamedTable<any, any>[]>(
	sheetsId: string,
	tables: [...T],
	globalOptions: SheetOptions = {},
) {
	const tablesSchema = Type.Intersect(tables);

	return {
		async get<N extends Static<TKeyOf<typeof tablesSchema>>>(
			tableName: N,
			options: SheetOptions = {},
		): Promise<Static<TIndexFromPropertyKey<Intersect<T>, N>>[]> {
			const columnsSchema = Type.Index(tablesSchema, [tableName]);

			if (TypeGuard.IsNever(columnsSchema)) {
				throw Error(
					`Table "${tableName}" is not defined when calling Spreadsheet function`,
				);
			}

			const { range, headers, ...fetcherOptions } = {
				...globalOptions,
				...options,
			};

			const queryParams = new URLSearchParams({
				sheet: tableName,
				tqx: 'out:csv',
			});

			if (range !== undefined) queryParams.append('range', range);
			if (headers !== undefined) queryParams.append('headers', `${headers}`);

			try {
				const res = await parseCSVFromUrl(
					`https://docs.google.com/spreadsheets/d/${sheetsId}/gviz/tq?${queryParams.toString()}`,
					columnsSchema,
					fetcherOptions,
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
