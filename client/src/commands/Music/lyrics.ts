import { ApplyOptions } from '@sapphire/decorators';
import type { Args } from '@sapphire/framework';
import { SubCommandPluginCommand, SubCommandPluginCommandOptions } from '@sapphire/plugin-subcommands';
import type { Message } from 'discord.js';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { Util } from 'discord.js';
import { send } from '@sapphire/plugin-editable-commands';

@ApplyOptions<SubCommandPluginCommandOptions>({
	description: 'Get lyrics for a song.',
	aliases: ['lyric', 'ly']
})
export class UserCommand extends SubCommandPluginCommand {
	public async messageRun(message: Message, args: Args) {
		const song = await args.rest('string').catch(() => null);
		const player = this.container.getPlayer(message);

		const current = player?.queue.current;

		try {
			if (!song && current) {
				const { title } = current;
				const cleaned = title
					.toLowerCase()
					.replace('official video', '')
					.replace(
						/\(lyrics|lyric|official music video|audio|official|official video|official video hd|clip officiel|clip|extended|hq\)/g,
						''
					)
					.replace('(', '')
					.replace(')', '')
					.replace('-', '')
					.replace(/\s+/g, ' ')
					.split(' ')
					.join(' ');

				send(message, 'Loading lyrics...');
				const lyric = await this.getLyrics(cleaned);

				const embed = this.container
					.embed({
						author: {
							name: message.author.tag,
							iconURL: message.author.displayAvatarURL({ format: 'png', dynamic: true })
						},
						title,
						color: 0x00ff00
					})
					.setTimestamp();

				Util.splitMessage(lyric, { maxLength: 1024 }).forEach((l) => embed.addField('\u200b', l));

				return send(message, { embeds: [embed] });
			}

			if (!song) return message.channel.send('Please provide a song name.');

			send(message, 'Loading lyrics...');
			const lyric = await this.getLyrics(song);

			const embed = this.container
				.embed({
					author: {
						name: message.author.tag,
						iconURL: message.author.displayAvatarURL({ format: 'png', dynamic: true })
					},
					title: `Results for ${song}`,
					color: 0x00ff00
				})
				.setTimestamp();

			Util.splitMessage(lyric, { maxLength: 1024 }).forEach((l) => embed.addField('\u200b', l));

			return send(message, { embeds: [embed] });
		} catch {
			return send(message, 'No lyric found.');
		}
	}

	private async getLyrics(song: string) {
		const res = await axios.get(`https://www.musixmatch.com/search/${song}`);
		const $ = cheerio.load(res.data);
		const searchLink = 'https://www.musixmatch.com' + $('a.title').first().attr('href');

		const res2 = await axios.get(searchLink);
		const $2 = cheerio.load(res2.data);
		const lyric = $2('.lyrics__content__ok').text();

		return lyric;
	}
}
