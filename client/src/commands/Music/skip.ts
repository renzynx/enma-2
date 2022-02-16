import { ApplyOptions } from '@sapphire/decorators';
import type { Args } from '@sapphire/framework';
import { SubCommandPluginCommand, SubCommandPluginCommandOptions } from '@sapphire/plugin-subcommands';
import type { Message } from 'discord.js';

@ApplyOptions<SubCommandPluginCommandOptions>({
	description: 'Skip the currently playing song or to a certain song in the queue.',
	preconditions: ['inVoiceChannel', 'sameVoiceChannel', 'isPlaying'],
	aliases: ['s', 'skipto', 'st'],
	detailedDescription:
		'skip `[position]` - Skip the current playing song or skip to a specific song in the queue \n You get the song position with command `queue`.'
})
export class UserCommand extends SubCommandPluginCommand {
	public async messageRun(message: Message, args: Args) {
		const player = this.container.getPlayer(message);

		if (!player || !player.queue.length) return message.channel.send('Im not playing anything!');

		const pos = await args.pick('number').catch(() => null);

		if (pos) {
			if (pos > player.queue.length + 1) return message.channel.send('❌  Invalid position.');
			message.channel.send(`✅  Skipped to **${player.queue[pos - 1].title}**`);
			return player.stop(pos);
		}

		message.channel.send(`⏭  Skipped **${player.queue.current?.title}**`);

		return player.stop();
	}
}
