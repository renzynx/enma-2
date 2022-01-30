import { Precondition } from '@sapphire/framework';
import type { Message } from 'discord.js';

export class UserPrecondition extends Precondition {
	public async run(message: Message) {
		return message.member?.voice.channelId ? this.ok() : this.error({ message: 'You need to be in a voice channel to use this command!' });
	}
}

declare module '@sapphire/framework' {
	interface Preconditions {
		inVoiceChannel: never;
	}
}
