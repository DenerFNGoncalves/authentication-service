export type ActorType = 'user' | 'system';

export class Actor {
	private constructor(
		readonly type: ActorType,
		readonly id?: string
	) {}

	static system(): Actor {
		return new Actor('system');
	}

	static user(userId: string): Actor {
		return new Actor('user', userId);
	}
}
