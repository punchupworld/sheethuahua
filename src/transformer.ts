import {
	Boolean,
	Date,
	Literal,
	Number,
	Optional,
	String,
	Transform,
	Union,
	type DateOptions,
	type NumberOptions,
	type SchemaOptions,
	type Static,
	type StringOptions,
	type TLiteralValue,
	type TOptional,
	type TSchema,
	type TString,
	type TTransform,
} from '@sinclair/typebox';
import { Value } from '@sinclair/typebox/value';

export function asBoolean(options?: SchemaOptions) {
	return createTransformer(
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
	);
}

export function asDate(options?: DateOptions) {
	return createTransformer(
		(str) => new global.Date(str),
		(date) => date.toISOString(),
		Date(options),
	);
}

export function asNumber(options?: NumberOptions) {
	return createTransformer(
		(str) => +str,
		(num) => num.toString(),
		Number(options),
	);
}

export function asOneOf<T extends TLiteralValue[]>(
	values: [...T],
	options?: SchemaOptions,
) {
	const schema = Union(
		values.map((value) => Literal(value)),
		options,
	);
	return createTransformer(
		(str) => Value.Convert(schema, str),
		(val) => val.toString(),
		schema,
	);
}

export function asString(options?: StringOptions) {
	return createTransformer(
		(str) => str,
		(str) => str,
		String(options),
	);
}

export function createTransformer<T>(
	decode: (value: string) => T,
	encode: (value: T) => string,
): TTransform<TString, T> & {
	optional: () => TOptional<TTransform<TString, T | undefined>>;
};
export function createTransformer<S extends TSchema, T = Static<S>>(
	decode: (value: string) => unknown,
	encode: (value: T) => string,
	decodeSchema: S,
): TTransform<TString, T> & {
	optional: () => TOptional<TTransform<TString, T | undefined>>;
};
export function createTransformer<S extends TSchema>(
	decode: (value: string) => unknown,
	encode: (value: unknown) => string,
	validateSchema?: S,
) {
	function safeDecode(value: string) {
		const output = decode(value);
		if (validateSchema) {
			Value.Assert(validateSchema, output);
		}
		return output;
	}

	return {
		...Transform(String())
			.Decode((value) => safeDecode(value))
			.Encode(encode),
		optional: () =>
			Optional(
				Transform(String())
					.Decode((value) => (value.length ? safeDecode(value) : undefined))
					.Encode(encode),
			),
	};
}
