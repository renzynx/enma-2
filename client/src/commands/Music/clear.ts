import { ApplyOptions } from '@sapphire/decorators';
import { send } from '@sapphire/plugin-editable-commands';
import { SubCommandPluginCommand, SubCommandPluginCommandOptions } from '@sapphire/plugin-subcommands';
import type { Message } from 'discord.js';

@ApplyOptions<SubCommandPluginCommandOptions>({
	description: 'Clear the current music queue.',
	aliases: ['clear', 'clr'],
	preconditions: ['inVoiceChannel', 'sameVoiceChannel', 'isPlaying']
})
export class UserCommand extends SubCommandPluginCommand {
	public async messageRun(message: Message) {
		const player = this.container.getPlayer(message);

		if (!player) return;

		player.queue.clear();

		return send(message, 'Cleared the queue!');
	}
}
