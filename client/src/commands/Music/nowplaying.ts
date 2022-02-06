import { ApplyOptions } from '@sapphire/decorators';
import { SubCommandPluginCommand, SubCommandPluginCommandOptions } from '@sapphire/plugin-subcommands';
import type { Message } from 'discord.js';
import { splitBar } from 'string-progressbar';

@ApplyOptions<SubCommandPluginCommandOptions>({
	description: 'Get the current playing song.',
	preconditions: ['isPlaying'],
	aliases: ['np']
})
export class UserCommand extends SubCommandPluginCommand {
	public async messageRun(message: Message) {
		const player = this.container.getPlayer(message);

		if (!player) return null;

		const embed = this.container.embed({
			author: {
				name: 'Now Playing',
				icon_url: 'https://raw.githubusercontent.com/renzynx/enma/main/assets/gif/spinAlt.gif'
			},
			description: `[${player.queue.current?.title}](${player.queue.current?.uri})`,
			color: '#FF0000',
			thumbnail: {
				url: player.queue.current?.thumbnail!
			},
			footer: {
				// @ts-ignore
				text: 'Requested by ' + player.queue.current?.requester.tag,
				// @ts-ignore
				icon_url: player.queue.current?.requester.avatarURL({ dynamic: true })
			},
			fields: [
				{
					name: 'Volume',
					value: `${player.volume}%`,
					inline: true
				},
				{
					name: 'Repeat',
					value: player.trackRepeat ? ':white_check_mark:' : ':x:',
					inline: true
				},
				{
					name: '\u200b',
					value: `[${this.convert(player.position)}] ${
						splitBar(
							player.queue.current?.duration! > 6.048e8 ? player.position : player.queue.current?.duration!,
							player.position,
							15
						)[0]
					} [${this.convert(player.queue.current?.duration!)}]`,
					inline: false
				}
			]
		});

		const msg = await message.channel.send({ embeds: [embed] });

		return setTimeout(() => msg.deletable && msg.delete(), player.queue.current?.duration);
	}

	// make a function covert milliseconds to mm:ss
	convert(milliseconds: number) {
		var seconds = Math.floor(milliseconds / 1000);
		var minutes = Math.floor(seconds / 60);
		seconds = seconds % 60;
		return minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
	}
}
