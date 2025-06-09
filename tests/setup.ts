import { afterEach, mock } from 'bun:test';

export const mockFetch = mock(
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	async (...arg) => new Response('Mock not specified', { status: 404 }),
);

export const mockConsoleDebug = mock();

global.fetch = mockFetch;
global.console.debug = mockConsoleDebug;

afterEach(() => {
	mockFetch.mockClear();
	mockConsoleDebug.mockClear();
});
