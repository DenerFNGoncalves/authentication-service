export type RefreshSessionRequest = {
	refreshToken: string;
	ip?: string;
	userAgent?: string;
};