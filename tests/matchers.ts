import { expect } from 'bun:test';

export async function expectToThrow(fn: () => unknown) {
	let hasThrown = false;

	try {
		await fn();
	} catch {
		hasThrown = true;
	}

	expect(hasThrown).toBeTrue();
}
