import {
	Type,
	type TProperties,
	type TObject,
	type TConst,
	type TRecordOrObject,
	type TPropertyKey,
} from '@sinclair/typebox';
import type { ColumnType } from './column';

export type TableDefition<
	N extends string,
	S extends TProperties
> = TRecordOrObject<TConst<N>, TObject<S>>;

export function Table<
	N extends string,
	S extends Record<TPropertyKey, ColumnType>
>(name: N, schema: S) {
	return Type.Record(Type.Const(name), Type.Object(schema));
}
