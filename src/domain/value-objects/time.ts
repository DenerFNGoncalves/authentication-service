import type { Brand } from './brand';

export type Minutes = Brand<number, 'Minutes'>;
export type Milliseconds = Brand<number, 'Milliseconds'>;
export type Days = Brand<number, 'Days'>;

function assertPositiveInt(value: number, unit: string) {
	if (!Number.isInteger(value) || value <= 0) {
		throw new Error(`${unit} must be a positive integer`);
	}
}

export namespace Time {
	export function minutes(minutes: number): Minutes {
		assertPositiveInt(minutes, 'Minutes');
		return minutes as Minutes;
	}

	export namespace minutes {
		export function toMilliseconds(minutes: Minutes): Milliseconds {
			return (minutes * 60 * 1000) as Milliseconds;
		}
	}

	export function days(days: number): Days {
		assertPositiveInt(days, 'Days');
		return days as Days;
	}

	export namespace days {
		export function toMilliseconds(days: Days): Milliseconds {
			return (days * 24 * 60 * 60 * 1000) as Milliseconds;
		}
	}
}
