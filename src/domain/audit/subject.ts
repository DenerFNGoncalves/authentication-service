export type SubjectType = 'user' | 'session' | 'token';

export class Subject {
	private constructor(
		readonly type: SubjectType,
		readonly id: string
	) {}

	static user(userId: string): Subject {
		return new Subject('user', userId);
	}

	static session(sessionId: string): Subject {
		return new Subject('session', sessionId);
	}

	static token(tokenId: string): Subject {
		return new Subject('token', tokenId);
	}
}
