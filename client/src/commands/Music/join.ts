import { ApplyOptions } from '@sapphire/decorators';
import { Command, CommandOptions } from '@sapphire/framework';
import { canJoinVoiceChannel } from '@sapphire/discord.js-utilities';
import type { Message } from 'discord.js';

@ApplyOptions<CommandOptions>({
	description: 'Make me join a voice channel!',
	preconditions: ['inVoiceChannel']
})
export class UserCommand extends Command {
	public async messageRun(message: Message) {
		if (!canJoinVoiceChannel(message.member!.voice.channel))
			return message.channel.send("Looks like i don't have the permission to join that voice channel!");
		const config = this.container.config.get(message.guild!.id!);

		const player =
			this.container.manager.players.get(message.guild!.id) ||
			this.container.manager.create({
				guild: message.guild!.id,
				voiceChannel: message.member!.voice.channelId!,
				textChannel: message.channel.id,
				selfDeafen: true,
				volume: config?.volume || 80
			});

		if (player.state === 'CONNECTED') return message.channel.send('I am already in a voice channel!');

		player.connect();

		return message.channel.send(`Connected to **${message.member!.voice.channel?.name}**`);
	}
}
