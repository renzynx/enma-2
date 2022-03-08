import { ApplyOptions } from '@sapphire/decorators';
import { SubCommandPluginCommand, SubCommandPluginCommandOptions } from '@sapphire/plugin-subcommands';
import type { Message } from 'discord.js';

@ApplyOptions<SubCommandPluginCommandOptions>({
	description: 'A basic command',
	preconditions: ['OwnerOnly']
})
export class UserCommand extends SubCommandPluginCommand {
	public async messageRun(message: Message) {
		const commands = this.container.stores.get('commands');

		for (const [_key, value] of commands) {
			value.reload();
			console.log(`Reloaded ${value.name}`);
		}

		return message.channel.send('FUCK OFF!');
	}
}
