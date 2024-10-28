import type { TLiteral } from '@sinclair/typebox';
import {
	DefaultErrorFunction,
	SetErrorFunction,
	ValueErrorType,
} from '@sinclair/typebox/errors';

SetErrorFunction((e) => {
	if (e.errorType === ValueErrorType.Union) {
		return `Expected one of [${e.schema.anyOf.map((value: TLiteral) => value.const).join(', ')}]`;
	}

	return DefaultErrorFunction(e);
});
