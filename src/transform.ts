import {
	Boolean,
	Date,
	Literal,
	Number,
	String,
	Transform,
	Union,
	type DateOptions,
	type NumberOptions,
	type SchemaOptions,
	type Static,
	type StringOptions,
	type TLiteralValue,
	type TSchema,
	type TString,
	type TTransform,
} from '@sinclair/typebox';
import { Value } from '@sinclair/typebox/value';

export const as = {
	Boolean: (options?: SchemaOptions) =>
		createTransformer(
			(str) => {
				switch (str.toLowerCase()) {
					case 'true':
					case '1':
						return true;
					case 'false':
					case '0':
						return false;
					default:
						return undefined;
				}
			},
			(num) => num.toString(),
			Boolean(options),
		),
	Date: (options?: DateOptions) =>
		createTransformer(
			(str) => new global.Date(str),
			(date) => date.toISOString(),
			Date(options),
		),
	Number: (options?: NumberOptions) =>
		createTransformer(
			(str) => +str,
			(num) => num.toString(),
			Number(options),
		),
	OneOf: <T extends TLiteralValue[]>(
		values: [...T],
		options?: SchemaOptions,
	) => {
		const schema = Union(
			values.map((value) => Literal(value)),
			options,
		);
		return createTransformer(
			(str) => Value.Convert(schema, str),
			(val) => val.toString(),
			schema,
		);
	},
	String: (options?: StringOptions) =>
		createTransformer(
			(str) => str,
			(str) => str,
			String(options),
		),
};

export function createTransformer<T>(
	decode: (value: string) => T,
	encode: (value: T) => string,
): TTransform<TString, T>;
export function createTransformer<S extends TSchema, T = Static<S>>(
	decode: (value: string) => unknown,
	encode: (value: T) => string,
	decodeSchema: S,
): TTransform<TString, T>;
export function createTransformer<S extends TSchema>(
	decode: (value: string) => unknown,
	encode: (value: unknown) => string,
	validateSchema?: S,
) {
	return Transform(String())
		.Decode((value) => {
			const output = decode(value);
			if (validateSchema) Value.Assert(validateSchema, output);
			return output;
		})
		.Encode(encode);
}
