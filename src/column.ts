import { Type, type TLiteralValue } from '@sinclair/typebox';

type PropertyReturnType<T extends { [key: string]: (...arg: any) => any }> =
	ReturnType<T[keyof T]>;

const PrimitiveColumn = {
	String: Type.String,
	Number: Type.Number,
	Boolean: Type.Boolean,
	Date: Type.Date,
};

type TPrimitiveColumn = PropertyReturnType<typeof PrimitiveColumn>;

export const Column = {
	...PrimitiveColumn,
	Optional: <T extends TPrimitiveColumn>(columnSchema: T) =>
		Type.Union([columnSchema, Type.Null()]),
	OneOf: <T extends TLiteralValue[]>(values: [...T]) =>
		Type.Union(values.map((value) => Type.Literal(value))),
};

export type TColumn = PropertyReturnType<typeof Column>;
