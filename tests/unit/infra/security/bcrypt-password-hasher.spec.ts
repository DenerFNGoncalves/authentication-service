import { describe, it, expect } from '@jest/globals';
import { BcryptPasswordHasher } from "@/infra/security/bcrypt-password-hasher";

describe('BcryptPasswordHasher', () => {
    it('should hashes and compares password correctly', async () => {
        const hasher = new BcryptPasswordHasher();

        const hash = await hasher.hash('password123');
        const result = await hasher.compare('password123', hash);

        expect(result).toBe(true);
    });

    it('should fail to compare password with wrong password', async () => {
        const hasher = new BcryptPasswordHasher();

        const hash = await hasher.hash('password123');
        const result = await hasher.compare('wrongpassword', hash);
        expect(result).toBe(false);
    });
});
