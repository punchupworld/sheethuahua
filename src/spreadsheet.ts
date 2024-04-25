import {
	Type,
	type Static,
	type TKeyOf,
	type TIndexFromPropertyKey,
	type Intersect,
} from '@sinclair/typebox';
import type { TableDefition } from './table';

export function Spreadsheet<T extends TableDefition<any, any>[]>(
	sheetsId: string,
	tables: [...T]
) {
	const tablesSchema = Type.Intersect(tables);

	return {
		get<N extends Static<TKeyOf<typeof tablesSchema>>>(
			tableName: N
		): Static<TIndexFromPropertyKey<Intersect<T>, N>> {
			const itemSchema = Type.Index(tablesSchema, [tableName]);

			return {} as Static<typeof itemSchema>;
		},
	};
}
