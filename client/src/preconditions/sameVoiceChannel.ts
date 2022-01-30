import { Precondition } from '@sapphire/framework';
import type { Message } from 'discord.js';

export class UserPrecondition extends Precondition {
	public async run(message: Message) {
		return message.member?.voice.channelId === message.guild?.me?.voice.channelId
			? this.ok()
			: this.error({ message: 'You will need to be in the same voice channel as mine to use this command!' });
	}
}

declare module '@sapphire/framework' {
	interface Preconditions {
		sameVoiceChannel: never;
	}
}
