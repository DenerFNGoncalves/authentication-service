import { Email } from '@/domain/auth/value-objects/email';

export type Credential = {
	email: Email;
	password: string;
};

export namespace Credentials {
	export function create(email: string, password: string): Credential {
		return {
			email: Email.create(email),
			password
		};
	}
}
