import {
	Parameters,
	Type,
	type DateOptions,
	type NumberOptions,
	type SchemaOptions,
	type StringOptions,
	type TLiteralValue,
} from '@sinclair/typebox';

type PropertyReturnType<T extends { [key: string]: (...arg: any) => any }> =
	ReturnType<T[keyof T]>;

/**
 * A set of functions to define the column type
 */
export const Column = {
	/**
	 * Each cell in the column must contain a string, can't be empty.
	 */
	String: (...arg: Parameters<typeof Type.String>) => Type.String(...arg),
	/**
	 * Each cell in the column will be parsed as a number, can't be empty.
	 */
	Number: (...arg: Parameters<typeof Type.Number>) => Type.Number(...arg),
	/**
	 * Each cell in the column will be parsed as a boolean, can't be empty.
	 */
	Boolean: (...arg: Parameters<typeof Type.Boolean>) => Type.Boolean(...arg),
	/**
	 * Each cell in the column will be parsed as a Date, can't be empty.
	 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date#date_time_string_format} for supported date string format
	 */
	Date: (...arg: Parameters<typeof Type.Date>) => Type.Date(...arg),
	/**
	 * Each cell in the column must be parsable as one of the given literal values, can't be empty.
	 * @param values - An array of literal values (string | number | boolean)
	 */
	OneOf: <T extends TLiteralValue[]>(values: [...T]) =>
		Type.Union(values.map((value) => Type.Literal(value))),
	/**
	 * Each cell in the column must contain a string, or parsed as null if empty.
	 */
	OptionalString: (options?: StringOptions) =>
		Type.Union([Type.String(options), Type.Null()]),
	/**
	 * Each cell in the column will be parsed as a number, or null if empty.
	 */
	OptionalNumber: (options?: NumberOptions) =>
		Type.Union([Type.Number(options), Type.Null()]),
	/**
	 * Each cell in the column will be parsed as a boolean, or null if empty.
	 */
	OptionalBoolean: (options?: SchemaOptions) =>
		Type.Union([Type.Boolean(options), Type.Null()]),
	/**
	 * Each cell in the column will be parsed as a Date, or null if empty.
	 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date#date_time_string_format} for supported date string format
	 */
	OptionalDate: (options?: DateOptions) =>
		Type.Union([Type.Date(options), Type.Null()]),
	/**
	 * Each cell in the column must be parsable as one of the given literal values, or null if empty.
	 * @param values - An array of literal values (string | number | boolean)
	 */
	OptionalOneOf: <T extends TLiteralValue[]>(values: [...T]) =>
		Type.Union([...values.map((value) => Type.Literal(value)), Type.Null()]),
};

export type TColumn = PropertyReturnType<typeof Column>;
