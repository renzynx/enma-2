import { ApplyOptions } from '@sapphire/decorators';
import type { Args } from '@sapphire/framework';
import { SubCommandPluginCommand, SubCommandPluginCommandOptions } from '@sapphire/plugin-subcommands';
import type { Message } from 'discord.js';

@ApplyOptions<SubCommandPluginCommandOptions>({
	description: 'Skip the current playing song.',
	preconditions: ['isPlaying'],
	aliases: ['s'],
	detailedDescription:
		'skip [position] - Skip the current playing song or skip to a specific song in the queue (get the song position with command `queue`).'
})
export class UserCommand extends SubCommandPluginCommand {
	public async messageRun(message: Message, args: Args) {
		const player = this.container.getPlayer(message);

		if (!player) return null;

		const pos = await args.pick('number').catch(() => null);

		if (pos) {
			if (pos > player.queue.length) return message.channel.send('❌  Invalid position.');
			message.channel.send(`✅  Skipped to **${player.queue[pos - 1].title}**`);
			return player.stop(pos);
		}

		message.channel.send(`⏭  Skipped **${player.queue.current?.title}**`);

		return player.stop();
	}
}
