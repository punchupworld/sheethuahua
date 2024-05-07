import {
	Type,
	type Static,
	type TConst,
	type TObject,
	type TPropertyKey,
	type TRecordOrObject,
} from '@sinclair/typebox';
import type { TColumn } from './column';

export type TColumnsDefinition = Record<TPropertyKey, TColumn>;

export type TAnonymousTable<C extends TColumnsDefinition> = TObject<C>;

export type TNamedTable<
	N extends string,
	C extends TColumnsDefinition,
> = TRecordOrObject<TConst<N>, TAnonymousTable<C>>;

export function Table<C extends TColumnsDefinition>(
	columns: C,
): TAnonymousTable<C>;
export function Table<N extends string, C extends TColumnsDefinition>(
	name: N,
	column: C,
): TNamedTable<N, C>;
export function Table<N extends string, C extends TColumnsDefinition>(
	...arg: [N, C] | [C]
) {
	return arg.length === 2
		? Type.Record(Type.Const(arg[0]), Type.Object(arg[1]))
		: Type.Object(arg[0]);
}

export type RowType<T> =
	T extends TNamedTable<any, any>
		? Static<T>[keyof Static<T>]
		: T extends TAnonymousTable<any>
			? Static<T>
			: unknown;
