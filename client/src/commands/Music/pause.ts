import { ApplyOptions } from '@sapphire/decorators';
import { SubCommandPluginCommand, SubCommandPluginCommandOptions } from '@sapphire/plugin-subcommands';
import type { Message } from 'discord.js';

@ApplyOptions<SubCommandPluginCommandOptions>({
	description: 'Pause the current playing song.',
	preconditions: ['inVoiceChannel', 'isPlaying', 'sameVoiceChannel']
})
export class UserCommand extends SubCommandPluginCommand {
	public async messageRun(message: Message) {
		const player = this.container.getPlayer(message);

		if (!player || !player.queue.length) return message.channel.send('Im not playing anything!');

		if (player.paused) return message.channel.send('⏸  The music is already paused.');

		player.pause(true);

		return message.channel.send('⏸  Paused **' + player.queue.current?.title + '**');
	}
}
