import { type TString, type TTransform } from '@sinclair/typebox';

/**
 * Column kind property name for schema identification
 */
export const ColumnKind = 'columnName';

/**
 * Column schema type
 */
export type TColumn<
	T extends TTransform<TString, any> = TTransform<TString, any>,
> = T & {
	[ColumnKind]: string;
};

/**
 * Map with CSV Column with the corresponded transformer
 * @param name - Column name
 * @param transformer - Column transformer
 * @example
 * ```ts
 * Column('name', asString());
 * ```
 */
export function Column<T extends TTransform<TString, any>>(
	name: string,
	transformer: T,
): TColumn<T> {
	return {
		...transformer,
		[ColumnKind]: name,
	};
}
