import type { TokenGenerator } from "@/application/ports/token-generator";
import { randomBytes } from 'node:crypto';

export class CryptoTokenGenerator implements TokenGenerator {
    generate(bytes: number = 64): string {
        return randomBytes(bytes).toString('hex');
    }
}