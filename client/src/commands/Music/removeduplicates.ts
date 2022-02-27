import { ApplyOptions } from '@sapphire/decorators';
import { send } from '@sapphire/plugin-editable-commands';
import { SubCommandPluginCommand, SubCommandPluginCommandOptions } from '@sapphire/plugin-subcommands';
import type { Message } from 'discord.js';

@ApplyOptions<SubCommandPluginCommandOptions>({
	description: 'Remove duplicate songs from the queue.',
	aliases: ['remove-duplicates', 'rmdupes', 'rmd', 'removedupes'],
	preconditions: ['inVoiceChannel', 'sameVoiceChannel']
})
export class UserCommand extends SubCommandPluginCommand {
	public async messageRun(message: Message) {
		const player = this.container.getPlayer(message);

		if (!player || !player.queue.length) return send(message, 'The queue is empty!');

		send(message, 'Removing duplicate songs from the queue...');

		const filteredQueue = [...new Map(player.queue.map((item) => [item.identifier, item])).values()];

		player.queue.clear();

		player.queue.add(filteredQueue);

		return send(message, 'Done!');
	}
}
