import type { AddressInfo } from 'node:net';
import { once } from 'node:events';
import type { Express } from 'express';

type HttpRequestOptions = {
	method?: string;
	path: string;
	body?: unknown;
	headers?: Record<string, string>;
};

export async function sendHttpRequest(app: Express, options: HttpRequestOptions) {
	const server = app.listen(0);
	await once(server, 'listening');

	const address = server.address() as AddressInfo;
	const url = `http://127.0.0.1:${address.port}${options.path}`;

	try {
		const requestInit: RequestInit = {
			method: options.method ?? 'POST',
			headers: {
				...(options.body !== undefined ? { 'content-type': 'application/json' } : {}),
				...options.headers
			}
		};

		if (options.body !== undefined) {
			requestInit.body = JSON.stringify(options.body);
		}

		const response = await fetch(url, requestInit);

		const text = await response.text();

		return {
			status: response.status,
			headers: response.headers,
			body: text ? JSON.parse(text) : undefined
		};
	} finally {
		await new Promise<void>((resolve, reject) => {
			server.close((error) => {
				if (error) {
					reject(error);
					return;
				}

				resolve();
			});
		});
	}
}
