import { Email } from '@/domain/value-objects/email';

export type AuthenticatedUser = {
	id: string;
	email: Email;
};

export namespace AuthenticatedUser {
	export function create(id: string, email: string): AuthenticatedUser {
		return { id, email: Email.create(email) };
	}
}
