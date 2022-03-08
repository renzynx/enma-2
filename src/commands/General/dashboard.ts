import { ApplyOptions } from '@sapphire/decorators';
import { send } from '@sapphire/plugin-editable-commands';
import { SubCommandPluginCommand, SubCommandPluginCommandOptions } from '@sapphire/plugin-subcommands';
import type { Message } from 'discord.js';

@ApplyOptions<SubCommandPluginCommandOptions>({
	description: 'Get bot dashboard link'
})
export class UserCommand extends SubCommandPluginCommand {
	public async messageRun(message: Message) {
		return send(message, 'https://beta.renzynx.space');
	}
}
