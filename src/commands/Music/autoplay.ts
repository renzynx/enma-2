import { ApplyOptions } from '@sapphire/decorators';
import { SubCommandPluginCommand, SubCommandPluginCommandOptions } from '@sapphire/plugin-subcommands';
import type { Message } from 'discord.js';

@ApplyOptions<SubCommandPluginCommandOptions>({
	description: 'Enable autoplay',
	preconditions: ['inVoiceChannel', 'sameVoiceChannel', 'isPlaying'],
	aliases: ['ap']
})
export class UserCommand extends SubCommandPluginCommand {
	public async messageRun(message: Message) {
		const player = this.container.getPlayer(message);

		if (!player) return message.channel.send('Im not playing anything!');

		const auto = player.get('autoplay') ?? false;

		player.set('autoplay', !auto);
		player.set('track', player.queue[player.queue.length - 1] || player.queue.current);

		return message.channel.send(`Autoplay is now ${!auto ? 'enabled' : 'disabled'}!`);
	}
}
