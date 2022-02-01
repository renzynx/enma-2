import { ApplyOptions } from '@sapphire/decorators';
import { Command, CommandOptions } from '@sapphire/framework';
import { send } from '@sapphire/plugin-editable-commands';
import { Message, MessageEmbed } from 'discord.js';

@ApplyOptions<CommandOptions>({
	description: 'Generate a help message for the bot.'
})
export class UserCommand extends Command {
	public async messageRun(message: Message) {
		const commands = this.container.stores.get('commands');

		const embed = new MessageEmbed().setColor('#808bed');

		let categories: string[] = [];

		for (const [_name, item] of commands) {
			categories.push(item.category!);
		}

		categories = this.removeDuplicates(categories);

		for (const category of categories) {
			embed.addField(
				category,
				commands
					.filter((c) => c.category === category)
					.map((c) => `\`${c.name}\``)
					.join(' ')
			);
		}

		return send(message, { embeds: [embed] });
	}

	private removeDuplicates(arr: string[]) {
		return [...new Set(arr)];
	}
}
