export type ActorType = 'user' | 'system' | 'anonymous';

export class Actor {
	private constructor(
		readonly type: ActorType,
		readonly id?: string
	) {}

	static anonymous(): Actor {
		return new Actor('anonymous');
	}

	static system(): Actor {
		return new Actor('system');
	}

	static user(userId: string): Actor {
		return new Actor('user', userId);
	}
}
