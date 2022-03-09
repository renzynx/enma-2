import { ApplyOptions } from '@sapphire/decorators';
import { container, Listener, ListenerOptions } from '@sapphire/framework';
import type { TextChannel, User } from 'discord.js';
import type { Player, Track } from 'erela.js';

@ApplyOptions<ListenerOptions>({})
export class UserEvent extends Listener {
	public constructor(context: Listener.Context, options: Listener.Options) {
		super(context, {
			...options,
			emitter: container.manager,
			event: 'trackStart'
		});
	}

	public async run(player: Player, track: Track) {
		const customTrackData = { ...track, position: player.position };
		this.container.current.set(player.guild, customTrackData);
		this.container.ws.emit(player.guild, customTrackData);
		const channel = this.container.client.channels.cache.get(player.textChannel!) as TextChannel;
		const embed = container
			.embed({
				footer: track.requester
					? {
							text: `Requested by ${(track.requester as User).tag}`,
							icon_url: (track.requester as User).displayAvatarURL({ dynamic: true })
					  }
					: undefined,
				description: `[${track.title}](${track.uri})`,
				author: { name: 'Now Playing', icon_url: 'https://raw.githubusercontent.com/renzynx/enma/main/assets/gif/spinMain.gif' }
			})
			.setColor('#808bed');

		if (channel) {
			const msg = await channel.send({ embeds: [embed] });
			const config = container.config.get(channel.guild.id);
			return config?.delete_message ? setTimeout(() => msg.deletable && msg.delete(), player.queue.current?.duration!) : null;
		}

		return null;
	}
}
