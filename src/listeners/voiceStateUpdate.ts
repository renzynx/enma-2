import { ApplyOptions } from '@sapphire/decorators';
import { Listener, ListenerOptions } from '@sapphire/framework';
import type { TextChannel, VoiceState } from 'discord.js';

@ApplyOptions<ListenerOptions>({})
export class UserEvent extends Listener {
	public async run(oldState: VoiceState, newState: VoiceState) {
		const [player, stay] = await Promise.all([
			this.container.manager.players.get(oldState.guild.id),
			this.container.config.get(oldState.guild.id)?.stay
		]);
		if (oldState.channelId !== oldState.guild.me?.voice.channelId || newState.channel) {
			if (player?.paused) player.pause(false);
		}

		if (oldState.channel?.members.size === 1) {
			if (player) player.pause(true);
			if (stay) return;
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
