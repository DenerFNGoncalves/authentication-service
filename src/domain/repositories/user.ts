import type { Email } from '../value-objects/email.js';
import { User } from '../entities/user.js';

export interface UserRepository {
	findByEmail(email: Email): Promise<User | null>;
	findById(id: string): Promise<User | null>;
}
