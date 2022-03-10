import { ApplyOptions } from '@sapphire/decorators';
import { Listener, ListenerOptions } from '@sapphire/framework';
import type { TextChannel, VoiceState } from 'discord.js';

@ApplyOptions<ListenerOptions>({})
export class UserEvent extends Listener {
	public run(oldState: VoiceState, newState: VoiceState) {
		const player = this.container.manager.players.get(oldState.guild.id);
		if (oldState.channelId !== oldState.guild.me?.voice.channelId || newState.channel) {
			if (player?.paused) player.pause(false);
		}

		if (oldState.channel?.members.size === 1) {
			if (player) player.pause(true);

			setTimeout(async () => {
				if (oldState.channel?.members.size === 1) {
					if (player) {
						player.destroy();
						const channel = (await this.container.client.channels.fetch(player.textChannel!)) as TextChannel;
						channel && channel.send(`The music has been stopped because no one has been on the voice channel for 10 minutes.`);
					}
				}
			}, 10 * 60 * 1000);
		}
	}
}
