import { ApplyOptions } from '@sapphire/decorators';
import { SubCommandPluginCommand, SubCommandPluginCommandOptions } from '@sapphire/plugin-subcommands';
import type { Message } from 'discord.js';

@ApplyOptions<SubCommandPluginCommandOptions>({
	description: 'Go back to previous skipped song.',
	preconditions: ['inVoiceChannel', 'sameVoiceChannel', 'isPlaying']
})
export class UserCommand extends SubCommandPluginCommand {
	public async messageRun(message: Message) {
		const player = this.container.getPlayer(message);

		if (!player) return message.channel.send('The queue is empty!');

		const previous = player.queue.previous;

		if (!previous) return message.channel.send('❌  There is no previous song.');

		player.queue.unshift(previous);
		player.stop();
		return message.channel.send('⏮  Skipped to previous song.');
	}
}
