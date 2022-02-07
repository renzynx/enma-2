import { ApplyOptions } from '@sapphire/decorators';
import { Command, CommandOptions, Args } from '@sapphire/framework';
import { send } from '@sapphire/plugin-editable-commands';
import type { Message } from 'discord.js';

@ApplyOptions<CommandOptions>({
	description: 'Play a song!',
	preconditions: ['inVoiceChannel'],
	aliases: ['p'],
	detailedDescription: 'play `<song> --s --r` - \n`--s` - Shuffle the queue.\n`--r` - Repeat the queue.',
	flags: ['shuffle', 's', 'repeat', 'r']
})
export class UserCommand extends Command {
	public async messageRun(message: Message, args: Args) {
		if (!message.guild || !message.member) return;

		const song = await args.rest('string').catch(() => null);

		if (!song) return send(message, 'You need to give me a URL or a query to search for!');

		const shuffle = args.getFlags('shuffle', 's');
		const repeat = args.getFlags('repeat', 'r');
		const config = this.container.config.get(message.guild.id);

		let res;

		const player =
			this.container.manager.players.get(message.guild.id) ??
			this.container.manager.create({
				guild: message.guild.id,
				voiceChannel: message.member.voice.channelId!,
				textChannel: message.channel.id,
				selfDeafen: true,
				volume: this.container.config.get(message.guild.id)?.volume
			});

		try {
			res = await this.container.manager.search(song, message.author);

			if (res.loadType === 'LOAD_FAILED') throw res.exception;
			else if (res.loadType === 'PLAYLIST_LOADED') {
				if (player.state !== 'CONNECTED') player.connect();
				player.queue.add(res.tracks);
				if (shuffle) player.queue.shuffle();
				if (repeat) player.setQueueRepeat(true);
				if (!player.playing && !player.paused && player.queue.totalSize === res.tracks.length) player.play();

				const playlist = this.container.embed({
					author: {
						name: message.author.username,
						iconURL: message.author.displayAvatarURL({ dynamic: true })
					},
					description: `Loaded playlist **${res.playlist?.name}** with ${res.tracks.length} tracks.`,
					color: 0x00ff00,
					thumbnail: { proxy_url: res.playlist?.selectedTrack?.thumbnail! }
				});

				if (shuffle) playlist.addField('Shuffle', ':white_check_mark:');
				if (repeat) playlist.addField('Queue Repeat', ':white_check_mark:');

				const msgSent = await send(message, { embeds: [playlist] });
				return config?.delete_message ? setTimeout(() => msgSent.deletable && msgSent.delete(), res.playlist?.duration!) : null;
			}
		} catch (err) {
			this.container.logger.error(err);
			return send(message, 'Something went wrong, please try this command later.');
		}

		if (res.loadType === 'NO_MATCHES') return message.reply('There was no tracks found with that query.');

		if (player.state !== 'CONNECTED') player.connect();

		player.queue.add(res.tracks[0]);

		if (!player.playing && !player.paused && !player.queue.size) player.play();

		const trackEnqueued = this.container.embed({
			author: {
				name: message.author.username,
				iconURL: message.author.displayAvatarURL({ dynamic: true })
			},
			description: `Enqueuing **${res.tracks[0].title}**.`,
			color: 0x00ff00
		});

		const msgSent = await send(message, { embeds: [trackEnqueued] });

		return config?.delete_message ? setTimeout(() => msgSent.deletable && msgSent.delete(), res.tracks[0].duration) : null;
	}
}
