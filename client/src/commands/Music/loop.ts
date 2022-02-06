import { ApplyOptions } from '@sapphire/decorators';
import type { Args } from '@sapphire/framework';
import { SubCommandPluginCommand, SubCommandPluginCommandOptions } from '@sapphire/plugin-subcommands';
import type { Message } from 'discord.js';

@ApplyOptions<SubCommandPluginCommandOptions>({
	description: 'Loop the current song or queue',
	preconditions: ['inVoiceChannel', 'isPlaying', 'sameVoiceChannel']
})
export class UserCommand extends SubCommandPluginCommand {
	public async messageRun(message: Message, args: Args) {
		const player = this.container.getPlayer(message);

		if (!player) return null;

		const options = await args.pick('string').catch(() => null);

		switch (options) {
			case 'queue':
				if (player.queueRepeat) return message.channel.send('🔁  Queue looping is already enabled.');
				player.setQueueRepeat(true);
				return message.channel.send('🔁  Queue looping enabled.');
			case 'song':
				if (player.trackRepeat) return message.channel.send('🔁  Song looping is already enabled.');
				player.setTrackRepeat(true);
				return message.channel.send('🔁  Song looping enabled.');
			default:
				if (player.trackRepeat) {
					player.setTrackRepeat(false);
					return message.channel.send('🔁  Song looping disabled.');
				}
				player.setTrackRepeat(true);
				return message.channel.send('🔁  Song looping enabled.');
		}
	}
}
