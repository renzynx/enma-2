import { ApplyOptions } from '@sapphire/decorators';
import { SubCommandPluginCommand, SubCommandPluginCommandOptions } from '@sapphire/plugin-subcommands';
import type { Message } from 'discord.js';

@ApplyOptions<SubCommandPluginCommandOptions>({
	description: 'A basic command',
	preconditions: ['inVoiceChannel', 'sameVoiceChannel', 'isPlaying']
})
export class UserCommand extends SubCommandPluginCommand {
	public async messageRun(message: Message) {
		const player = this.container.manager.players.get(message.guild?.id!);

		if (!player || !player.queue.length) return message.channel.send('Im not playing anything!');

		player.queue.shuffle();

		return message.channel.send(`${player?.queue.length} songs has been shuffled in the queue!`);
	}
}
