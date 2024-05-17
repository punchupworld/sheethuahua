import {
	Type,
	type Static,
	type TConst,
	type TObject,
	type TPropertyKey,
	type TRecordOrObject,
} from '@sinclair/typebox';
import type { TColumn } from './column';

/**
 * An object with key of column's name and value of column's type
 */
export type TColumnsDefinition = Record<TPropertyKey, TColumn>;

/**
 * Anonymous table
 */
export type TAnonymousTable<C extends TColumnsDefinition> = TObject<C>;

/**
 * Named table
 */
export type TNamedTable<
	N extends string,
	C extends TColumnsDefinition,
> = TRecordOrObject<TConst<N>, TAnonymousTable<C>>;

/**
 * Define a table structure.
 * @param name - (optional) Table name
 * @param columns - Columns' definition object ({@link TColumnsDefinition})
 * @returns The table, either {@link TNamedTable} if the name is given, or {@link TAnonymousTable} if not
 */
export function Table<C extends TColumnsDefinition>(
	columns: C,
): TAnonymousTable<C>;
export function Table<N extends string, C extends TColumnsDefinition>(
	name: N,
	columns: C,
): TNamedTable<N, C>;
export function Table<N extends string, C extends TColumnsDefinition>(
	...arg: [N, C] | [C]
) {
	return arg.length === 2
		? Type.Record(Type.Const(arg[0]), Type.Object(arg[1]))
		: Type.Object(arg[0]);
}

/**
 * Infer row type from the table.
 * @param T - The table
 * @returns Row type (an object)
 */
export type RowType<T> =
	T extends TNamedTable<any, any>
		? Static<T>[keyof Static<T>]
		: T extends TAnonymousTable<any>
			? Static<T>
			: unknown;
