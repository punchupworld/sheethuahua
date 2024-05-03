import {
	Type,
	type DateOptions,
	type NumberOptions,
	type SchemaOptions,
	type StringOptions,
	type TLiteralValue,
} from '@sinclair/typebox';

type PropertyReturnType<T extends { [key: string]: (...arg: any) => any }> =
	ReturnType<T[keyof T]>;

export const Column = {
	String: Type.String,
	Number: Type.Number,
	Boolean: Type.Boolean,
	Date: Type.Date,
	OneOf: <T extends TLiteralValue[]>(values: [...T]) =>
		Type.Union(values.map((value) => Type.Literal(value))),
	OptionalString: (options?: StringOptions) =>
		Type.Union([Type.String(options), Type.Null()]),
	OptionalNumber: (options?: NumberOptions) =>
		Type.Union([Type.Number(options), Type.Null()]),
	OptionalBoolean: (options?: SchemaOptions) =>
		Type.Union([Type.Boolean(options), Type.Null()]),
	OptionalDate: (options?: DateOptions) =>
		Type.Union([Type.Date(options), Type.Null()]),
	OptionalOneOf: <T extends TLiteralValue[]>(values: [...T]) =>
		Type.Union([...values.map((value) => Type.Literal(value)), Type.Null()]),
};

export type TColumn = PropertyReturnType<typeof Column>;
