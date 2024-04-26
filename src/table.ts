import {
	Type,
	type TConst,
	type TObject,
	type TPropertyKey,
	type TRecordOrObject,
} from '@sinclair/typebox';
import type { TColumn } from './column';

export type TColumnsDefinition = Record<TPropertyKey, TColumn>;

export type TTable<
	N extends string,
	S extends TColumnsDefinition,
> = TRecordOrObject<TConst<N>, TObject<S>>;

export function Table<N extends string, C extends TColumnsDefinition>(
	name: N,
	columns: C,
) {
	return Type.Record(Type.Const(name), Type.Object(columns));
}

export type RowType<T extends TTable<string, TColumnsDefinition>> =
	T['static'][keyof T['static']];
