import { ApplyOptions } from '@sapphire/decorators';
import type { Args } from '@sapphire/framework';
import { SubCommandPluginCommand, SubCommandPluginCommandOptions } from '@sapphire/plugin-subcommands';
import type { Message } from 'discord.js';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { Util } from 'discord.js';
import { send } from '@sapphire/plugin-editable-commands';
import { PaginatedMessage } from '@sapphire/discord.js-utilities';
import { sendLoadingMessage } from '../../lib/utils';

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

				const response = await sendLoadingMessage(message);
				const lyric = await this.getLyrics(cleaned);

				if (!lyric) return response.edit(`No lyrics found for **${title}**.`);

				if (lyric.length > 2047) {
					const paginatedMessage = new PaginatedMessage({
						template: this.container
							.embed({
								author: {
									name: message.author.tag,
									iconURL: message.author.displayAvatarURL({ format: 'png', dynamic: true })
								}
							})
							.setTitle(`${title}'s lyrics`)
							.setColor(0x00ff00)
							.setThumbnail(message.guild?.iconURL({ dynamic: true })!)
						// Be sure to add a space so this is offset from the page numbers!
					});

					Util.splitMessage(lyric, { maxLength: 2047 }).forEach((l) => paginatedMessage.addPageEmbed((embed) => embed.setDescription(l)));
					await paginatedMessage.run(response, message.author);
					return response;
				}

				return send(message, {
					embeds: [
						this.container
							.embed({
								author: {
									name: message.author.tag,
									iconURL: message.author.displayAvatarURL({ format: 'png', dynamic: true })
								}
							})
							.setTitle(`${title}'s lyrics`)
							.setColor(0x00ff00)
							.setDescription(lyric)
							.setThumbnail(message.guild?.iconURL({ dynamic: true })!)
					]
				});
			}

			if (!song) return message.channel.send('Please provide a song name.');

			const response = await sendLoadingMessage(message);
			const lyric = await this.getLyrics(song);

			if (!lyric) return response.edit('Could not find any lyrics for that song.');

			if (lyric.length > 2047) {
				const paginatedMessage = new PaginatedMessage({
					template: this.container
						.embed()
						.setAuthor({
							name: message.author.tag,
							iconURL: message.author.displayAvatarURL({ format: 'png', dynamic: true })
						})
						.setTitle(`${song}'s lyrics`)
						.setColor(0x00ff00)
						.setThumbnail(message.guild?.iconURL({ dynamic: true })!)
					// Be sure to add a space so this is offset from the page numbers!
				});

				Util.splitMessage(lyric, { maxLength: 2047 }).forEach((l) => paginatedMessage.addPageEmbed((embed) => embed.setDescription(l)));

				await paginatedMessage.run(response, message.author);

				return response;
			}

			return send(message, {
				embeds: [
					this.container
						.embed()
						.setAuthor({
							name: message.author.tag,
							iconURL: message.author.displayAvatarURL({ format: 'png', dynamic: true })
						})
						.setTitle(`${song}'s lyrics`)
						.setColor(0x00ff00)
						.setDescription(lyric)
						.setThumbnail(message.guild?.iconURL({ dynamic: true })!)
				]
			});
		} catch {
			return send(message, `Something went wrong please try this command later.`);
		}
	}

	private async getLyrics(song: string) {
		const encodedUri = encodeURI(song);
		const res = await axios.get(`https://www.musixmatch.com/search/${encodedUri}`);
		const $ = cheerio.load(res.data);
		const searchLink = 'https://www.musixmatch.com' + $('a.title').first().attr('href');

		const res2 = await axios.get(searchLink);
		const $2 = cheerio.load(res2.data);
		const lyric = $2('.lyrics__content__ok').text();

		return lyric;
	}
}
