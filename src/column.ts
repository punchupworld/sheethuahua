import { type TString, type TTransform } from '@sinclair/typebox';

export const ColumnKind = 'columnName';

/**
 * Column schema type
 */
export type TColumn<T = any> = TTransform<TString, T> & {
	[ColumnKind]: string;
};

/**
 * Map with CSV Column with the corresponded schema
 * @param name - Column name
 * @param schema - Column schema
 */
export function Column<T>(
	name: string,
	schema: TTransform<TString, T>,
): TColumn<T> {
	return {
		...schema,
		[ColumnKind]: name,
	};
}
