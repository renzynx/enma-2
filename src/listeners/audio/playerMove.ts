import { ApplyOptions } from '@sapphire/decorators';
import { container, Listener, ListenerOptions } from '@sapphire/framework';
import type { Player } from 'erela.js';

@ApplyOptions<ListenerOptions>({})
export class UserEvent extends Listener {
	public constructor(context: Listener.Context, options: Listener.Options) {
		super(context, {
			...options,
			emitter: container.manager,
			event: 'playerMove'
		});
	}

	public run(player: Player, _oldChannel: string, newChannel: string) {
		if (!newChannel) return player.destroy();
		return player.setVoiceChannel(newChannel);
	}
}
