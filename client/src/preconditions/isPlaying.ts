import { Precondition } from '@sapphire/framework';
import type { Message } from 'discord.js';

export class UserPrecondition extends Precondition {
	public async run(message: Message) {
		const player = this.container.getPlayer(message);

		return player ? this.ok() : this.error({ message: `I'm not playing anything!` });
	}
}

declare module '@sapphire/framework' {
	interface Preconditions {
		isPlaying: never;
	}
}
