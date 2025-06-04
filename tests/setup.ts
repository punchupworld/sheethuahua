import { afterEach, mock } from 'bun:test';

export const mockFetch = mock(
	async () => new Response('Mock not specified', { status: 404 }),
);

global.fetch = mockFetch;

afterEach(() => {
	mockFetch.mockClear();
});
