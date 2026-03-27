import type { PasswordHasher } from "@/application/ports/password-hasher";
import bcrypt from 'bcrypt';

export class BcryptPasswordHasher implements PasswordHasher {
    async hash(plain: string): Promise<string> {
        return await bcrypt.hash(plain, 10);
    }

    compare(plain: string, hashed: string): Promise<boolean> {
        return bcrypt.compare(plain, hashed);
    }
}