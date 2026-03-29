import { describe, it, expect } from '@jest/globals';
import { CryptoTokenGenerator } from '@/infra/security/crypto-token-generator';

describe('CryptoTokenGenerator', () => {
	it('should generate a token with the default length', async () => {
		const cryptoGenerator = new CryptoTokenGenerator();
		const _defaultLength = 64;

		const hash = await cryptoGenerator.generate();
		expect(hash).toHaveLength(_defaultLength * 2); // Each byte is represented by 2 hex characters
	});

	it('should generate a token with the given length', async () => {
		const cryptoGenerator = new CryptoTokenGenerator();
		const length = 32;

		const hash = await cryptoGenerator.generate(length);
		expect(hash).toHaveLength(length * 2); // Each byte is represented by 2 hex characters
	});
});
