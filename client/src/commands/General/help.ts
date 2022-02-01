import { ApplyOptions } from '@sapphire/decorators';
import { Args, Command, CommandOptions } from '@sapphire/framework';
import { send } from '@sapphire/plugin-editable-commands';
import { Message, MessageEmbed } from 'discord.js';

@ApplyOptions<CommandOptions>({
	description: 'Generate a help message for the bot.',
	detailedDescription: 'help `[command]` - If a command is specified, it will show the help for that command.'
})
export class UserCommand extends Command {
	public async messageRun(message: Message, args: Args) {
		const command = await args.pick('string').catch(() => null);
		const config = this.container.config.get(message.guild!.id);

		const embed = new MessageEmbed({
			author: { name: message.author.username, icon_url: message.author.displayAvatarURL({ format: 'jpeg', dynamic: true }) },
			footer: { text: command ? 'Text wrapped inside with [] is optional, <> is required.' : '' }
		})
			.setColor('#808bed')
			.setThumbnail(this.container.client?.user?.displayAvatarURL({ format: 'jpeg' })!);

		if (command) {
			const findCommand = this.store.get(command) as UserCommand;

			if (findCommand) {
				embed.addFields([
					{
						name: '❯  Command',
						value: findCommand.name,
						inline: true
					},
					{
						name: '❯  Description',
						value: findCommand.description,
						inline: true
					},
					{
						name: '❯  Category',
						value: findCommand.category || 'General',
						inline: true
					},
					{
						name: '❯  Aliases',
						value: findCommand.aliases.length ? findCommand.aliases.join(', ') : 'None',
						inline: true
					},
					{
						name: '❯  Usage',
						value: `${config?.prefix}${findCommand.detailedDescription}`,
						inline: true
					}
				]);

				return send(message, { embeds: [embed] });
			}
		}

		const commands = this.container.stores.get('commands');

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
