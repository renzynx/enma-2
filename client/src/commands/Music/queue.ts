import { ApplyOptions } from '@sapphire/decorators';
import { PaginatedMessage } from '@sapphire/discord.js-utilities';
import { SubCommandPluginCommand, SubCommandPluginCommandOptions } from '@sapphire/plugin-subcommands';
import { sendLoadingMessage } from '../../lib/utils';
import type { Message } from 'discord.js';

@ApplyOptions<SubCommandPluginCommandOptions>({
	description: 'Get the current music queue.',
	preconditions: ['isPlaying']
})
export class UserCommand extends SubCommandPluginCommand {
	public async messageRun(message: Message) {
		const response = await sendLoadingMessage(message);
		const player = this.container.getPlayer(message);

		if (!player) return;

		const multiply = 10;
		const pages = Math.ceil(player.queue.length / multiply);
		const queue = player.queue;

		const paginatedMessage = new PaginatedMessage({
			template: this.container
				.embed()
				.setAuthor({ name: 'Music queue for ' + message.guild?.name })
				.setTitle(`${player.queue.length} ${player.queue.length > 2 ? 'songs' : 'song'} in queue`)
				.setColor('#FF0000')
				.setThumbnail(message.guild?.iconURL({ dynamic: true })!)
			// Be sure to add a space so this is offset from the page numbers!
		});

		if (!queue.length) {
			paginatedMessage.addPageEmbed((embed) => {
				return player.queue.current
					? embed.addField('🎵   Currently Playing', `[${player.queue.current.title}](${player.queue.current.uri})`)
					: embed;
			});
			await paginatedMessage.run(response, message.author);

			return response;
		}

		for (let j = 0; j < pages; j++) {
			const page = queue.slice(j * multiply, (j + 1) * multiply);
			paginatedMessage.addPageEmbed((embed) => {
				player.queue.current
					? embed.addField('🎵   Currently Playing', `[${player.queue.current.title}](${player.queue.current.uri})`)
					: null;

				player.queueRepeat ? embed.addField('Queue Repeat', ':white_check_mark:') : null;

				return embed.setDescription(page.map((track, index) => `**${multiply * j + 1 + index}.** [${track.title}](${track.uri})`).join('\n'));
			});
		}

		await paginatedMessage.run(response, message.author);

		return response;
	}
}
