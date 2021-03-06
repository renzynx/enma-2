import { ApplyOptions } from '@sapphire/decorators';
import type { Args } from '@sapphire/framework';
import { SubCommandPluginCommand, SubCommandPluginCommandOptions } from '@sapphire/plugin-subcommands';
import type { Message } from 'discord.js';

@ApplyOptions<SubCommandPluginCommandOptions>({
	description: 'Remove a song from the queue.',
	preconditions: ['inVoiceChannel', 'sameVoiceChannel', 'isPlaying'],
	aliases: ['rm'],
	detailedDescription: 'remove <position> - Remove a song from the queue (get the song position with command `queue`).'
})
export class UserCommand extends SubCommandPluginCommand {
	public async messageRun(message: Message, args: Args) {
		const player = this.container.getPlayer(message);

		if (!player || !player.queue.length) return message.channel.send('Im not playing anything!');

		const pos = await args.pick('number').catch(() => null);

		if (pos) {
			if (pos > player.queue.length + 1) return message.channel.send('❌  Invalid position.');
			message.channel.send(`✅  Removed ${player.queue[pos - 1].title}`);
			return player.queue.remove(pos - 1);
		}

		return message.channel.send('❌  You must specify a position (use command `queue` to get the position).');
	}
}
