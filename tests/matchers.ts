import { expect } from 'bun:test';

export async function expectToThrow(fn: () => unknown, expectedError: any) {
	let receivedError: any;

	try {
		await fn();
	} catch (e) {
		receivedError = e;
	}

	expect(receivedError).toBe(expectedError);
}
