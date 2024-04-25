import {
	Type,
	type Static,
	type TKeyOf,
	type TIndexFromPropertyKey,
	type Intersect,
} from '@sinclair/typebox';
import { Value } from '@sinclair/typebox/value';
import { autoType, csvParse } from 'd3-dsv';
import type { TableDefition } from './table';

export function Spreadsheet<T extends TableDefition<any, any>[]>(
	sheetsId: string,
	tables: [...T]
) {
	const tablesSchema = Type.Intersect(tables);

	return {
		async get<N extends Static<TKeyOf<typeof tablesSchema>>>(
			tableName: N
		): Promise<Static<TIndexFromPropertyKey<Intersect<T>, N>>[]> {
			const rowsSchema = Type.Array(Type.Index(tablesSchema, [tableName]));

			const res = await fetch(
				`https://docs.google.com/spreadsheets/d/${sheetsId}/gviz/tq?tqx=out:csv&sheet=${tableName}`
			);

			if (!res.ok) {
				throw new Error(
					res.status === 404
						? `Could not get the data, does sheet id "${sheetsId}" and table name "${tableName}" valid and public?`
						: res.statusText
				);
			}

			const rows = csvParse(await res.text(), autoType);

			if (!Value.Check(rowsSchema, rows)) {
				throw [...Value.Errors(rowsSchema, rows)];
			}

			return rows;
		},
	};
}
