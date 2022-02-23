import { ApplyOptions } from '@sapphire/decorators';
import { container, Listener, ListenerOptions } from '@sapphire/framework';
import type { TextChannel } from 'discord.js';
import type { Player, Track } from 'erela.js';

@ApplyOptions<ListenerOptions>({})
export class UserEvent extends Listener {
	public constructor(context: Listener.Context, options: Listener.Options) {
		super(context, {
			...options,
			emitter: container.manager,
			event: 'queueEnd'
		});
	}

	public async run(player: Player) {
		const autoplay = player.get('autoplay');

		if (autoplay) {
			const channel = this.container.client.channels.cache.get(player.textChannel!) as TextChannel;
			channel.send('🎵  Autoplay enabled, finding similar songs...');
			const previous = player.get<Track>('track');
			const playlistUrl = `https://www.youtube.com/watch?v=${previous?.identifier}&list=RD${previous?.identifier}`;
			const res = await container.manager.search(playlistUrl, previous?.requester);
			player.queue.add(res.tracks.sort(() => 0.5 - Math.random()));
			if (!player.playing && !player.paused && player.queue.totalSize === res.tracks.length) player.play();
			return;
		}

		const channel = this.container.client.channels.cache.get(player.textChannel!) as TextChannel;
		const config = container.config.get(channel.guild.id);
		if (config && config.stay) {
			if (player.trackRepeat) player.setTrackRepeat(false);
			if (player.queueRepeat) player.setQueueRepeat(false);
			return channel && channel.send('Queue has ended');
		}
		channel && channel.send('Queue has ended, i hope you enjoyed the session!');
		container.context.delete(player.guild);
		return player.destroy();
	}
}
