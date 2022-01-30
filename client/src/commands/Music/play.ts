import { ApplyOptions } from '@sapphire/decorators';
import { Command, CommandOptions, Args } from '@sapphire/framework';
import { send } from '@sapphire/plugin-editable-commands';
import type { Message } from 'discord.js';

@ApplyOptions<CommandOptions>({
	description: 'Play a song!',
	preconditions: ['inVoiceChannel'],
	aliases: ['p']
})
export class UserCommand extends Command {
	public async messageRun(message: Message, args: Args) {
		if (!message.guild || !message.member) return;

		const song = await args.rest('string');

		if (!song) return send(message, 'You need to give me a URL or a query to search for!');

		let res;

		const player =
			this.container.manager.players.get(message.guild.id) ||
			this.container.manager.create({
				guild: message.guild.id,
				voiceChannel: message.member.voice.channelId!,
				textChannel: message.channel.id,
				selfDeafen: true,
				volume: 85
			});

		try {
			res = await this.container.manager.search(song, message.author);

			if (res.loadType === 'LOAD_FAILED') throw res.exception;
			else if (res.loadType === 'PLAYLIST_LOADED') {
				if (player.state !== 'CONNECTED') player.connect();
				player.queue.add(res.tracks);
				if (!player.playing && !player.paused && player.queue.totalSize === res.tracks.length) player.play();
				return send(message, `Enqueuing playlist \`${res.playlist?.name}\` with ${res.tracks.length} tracks.`);
			}
		} catch (err) {
			this.container.logger.error(err);
			return send(message, 'Something went wrong, please try this command later.');
		}

		if (res.loadType === 'NO_MATCHES') return message.reply('There was no tracks found with that query.');

		if (player.state !== 'CONNECTED') player.connect();

		player.queue.add(res.tracks[0]);

		if (!player.playing && !player.paused && !player.queue.size) player.play();

		return send(message, `Enqueuing **${res.tracks[0].title}** (requested by **${message.author.username}**)`);
	}
}
