import { ApplyOptions } from '@sapphire/decorators';
import { Command, CommandOptions } from '@sapphire/framework';
import type { Message } from 'discord.js';

@ApplyOptions<CommandOptions>({
	description: 'Make me join a voice channel!'
})
export class UserCommand extends Command {
	public async messageRun(message: Message) {
		if (!message.guild || !message.member) return;

		if (!message.member.voice.channelId) return message.channel.send('You need to be in a voice channel to use this command!');

		const player =
			this.container.manager.players.get(message.guild.id) ||
			this.container.manager.create({
				guild: message.guild.id,
				voiceChannel: message.member.voice.channelId!,
				textChannel: message.channel.id,
				selfDeafen: true,
				volume: 85
			});

		if (player.state === 'CONNECTED') return message.channel.send('I am already in a voice channel!');

		player.connect();

		return message.channel.send(`Connected to **${message.member.voice.channel?.name}**`);
	}
}
