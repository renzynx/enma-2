import { ApplyOptions } from '@sapphire/decorators';
import { container, Listener, ListenerOptions } from '@sapphire/framework';
import type { TextChannel } from 'discord.js';
import type { Player } from 'erela.js';

@ApplyOptions<ListenerOptions>({})
export class UserEvent extends Listener {
	public constructor(context: Listener.Context, options: Listener.Options) {
		super(context, {
			...options,
			emitter: container.manager,
			event: 'queueEnd'
		});
	}

	public run(player: Player) {
		const channel = this.container.client.channels.cache.get(player.textChannel!) as TextChannel;
		const config = container.config.get(channel.guild.id);
		if (config && config.stay) {
			if (player.trackRepeat) player.setTrackRepeat(false);
			if (player.queueRepeat) player.setQueueRepeat(false);
			return channel && channel.send('Queue ended');
		}
		channel && channel.send('Queue has ended, i hope you enjoyed the session!');
		container.context.delete(player.guild);
		return player.destroy();
	}
}
