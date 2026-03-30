import type { Brand } from './brand';

export type Email = Brand<string, 'Email'>;

export namespace Email {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

	function validateEmail(email: string): boolean {
		return emailRegex.test(email);
	}

	function normalize(email: string): string {
		return email.trim().toLowerCase();
	}

	export function create(email: string): Email {
		email = normalize(email);

		if (!validateEmail(email)) {
			throw new Error('Invalid email format');
		}
		return email as Email;
	}

	export function equals(email1: Email, email2: Email): boolean {
		return normalize(email1) === normalize(email2);
	}
}
