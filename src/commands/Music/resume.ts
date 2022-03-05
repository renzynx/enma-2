import { ApplyOptions } from '@sapphire/decorators';
import { SubCommandPluginCommand, SubCommandPluginCommandOptions } from '@sapphire/plugin-subcommands';
import type { Message } from 'discord.js';

@ApplyOptions<SubCommandPluginCommandOptions>({
	description: 'Resume the current paused song.',
	preconditions: ['inVoiceChannel', 'sameVoiceChannel']
})
export class UserCommand extends SubCommandPluginCommand {
	public async messageRun(message: Message) {
		const player = this.container.getPlayer(message);

		if (!player) return message.channel.send('Im not playing anything!');

		if (!player.paused) return message.channel.send('⏯  The music is not paused.');

		player.pause(false);
		return message.channel.send('⏯  Resumed **' + player.queue.current?.title + '**');
	}
}
