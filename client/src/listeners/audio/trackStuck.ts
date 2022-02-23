import { ApplyOptions } from '@sapphire/decorators';
import { container, Listener, ListenerOptions } from '@sapphire/framework';
import type { TextChannel } from 'discord.js';
import type { Player, Track, TrackStuckEvent } from 'erela.js';

@ApplyOptions<ListenerOptions>({})
export class UserEvent extends Listener {
	public constructor(context: Listener.Context, options: Listener.Options) {
		super(context, {
			...options,
			emitter: container.manager,
			event: 'trackStuck'
		});
	}

	public run(player: Player, track: Track, payload: TrackStuckEvent) {
		container.logger.debug(payload);

		const channel = container.client.channels.cache.get(player.textChannel!) as TextChannel;

		channel.send(`${track.title} is stuck! skipping to the next track.`);
		return player.stop();
	}
}
