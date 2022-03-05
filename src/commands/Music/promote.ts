import { ApplyOptions } from '@sapphire/decorators';
import { SubCommandPluginCommand, SubCommandPluginCommandOptions } from '@sapphire/plugin-subcommands';
import type { Message } from 'discord.js';
import type { Args } from '@sapphire/framework';

@ApplyOptions<SubCommandPluginCommandOptions>({
	description: 'Promote a song to the top of the queue.',
	preconditions: ['inVoiceChannel', 'sameVoiceChannel', 'isPlaying'],
	detailedDescription: 'promote <position> - Get the song position with command `queue`.'
})
export class UserCommand extends SubCommandPluginCommand {
	public async messageRun(message: Message, args: Args) {
		const player = this.container.getPlayer(message);

		if (!player || !player.queue.length) return message.channel.send('The queue is empty!');

		const pos = await args.pick('number').catch(() => null);

		if (pos) {
			if (pos > player.queue.length + 1) return message.channel.send('❌  Invalid position.');

			const item = player.queue.splice(pos - 1, 1)[0];
			player.queue.unshift(item);

			return message.channel.send(`✅  Promoted **${item.title}**`);
		}

		return message.channel.send('❌  You need to give a song position to promote.');
	}
}
