export type AccessTokens = {
	accessToken: string;
	expiresIn: number;
};

export type SessionTokens = AccessTokens & {
	refreshToken: string;
};
