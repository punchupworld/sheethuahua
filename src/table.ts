import {
	Type,
	type TConst,
	type TObject,
	type TPropertyKey,
	type TRecordOrObject,
} from '@sinclair/typebox';
import type { ColumnType } from './column';

type TableSchemaType = Record<TPropertyKey, ColumnType>;

export type TableDefition<
	N extends string,
	S extends TableSchemaType,
> = TRecordOrObject<TConst<N>, TObject<S>>;

export function Table<N extends string, S extends TableSchemaType>(
	name: N,
	schema: S,
) {
	return Type.Record(Type.Const(name), Type.Object(schema));
}

export type TableRow<T extends TableDefition<string, TableSchemaType>> =
	T['static'][keyof T['static']];
