import { ApplyOptions } from '@sapphire/decorators';
import { PaginatedMessage } from '@sapphire/discord.js-utilities';
import { Args, Command, CommandOptions } from '@sapphire/framework';
import { send } from '@sapphire/plugin-editable-commands';
import { Message, MessageEmbed } from 'discord.js';
import { sendLoadingMessage } from '../../lib/utils';

@ApplyOptions<CommandOptions>({
	description: 'Generate a help message for the bot.',
	detailedDescription: 'help `[command]` - If a command is specified, it will show the help for that command.'
})
export class UserCommand extends Command {
	public async messageRun(message: Message, args: Args) {
		const command = await args.pick('string').catch(() => null);

		if (command === 'newHelp') return this.newHelp(message);

		const config = this.container.config.get(message.guild!.id);

		const embed = new MessageEmbed({
			author: { name: message.author.username, icon_url: message.author.displayAvatarURL({ dynamic: true }) },
			footer: { text: command ? 'Argument wrapped inside with [] is optional, <> is required.' : `Current prefix: ${config?.prefix}` }
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
						value: `${config?.prefix}${findCommand.detailedDescription ? findCommand.detailedDescription : findCommand.name}`,
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

	private async newHelp(message: Message) {
		const response = await sendLoadingMessage(message);
		const config = this.container.config.get(message.guild?.id!);

		const paginatedMessage = new PaginatedMessage({
			template: new MessageEmbed({
				footer: { text: `To get help about a specific command use ${config?.prefix}help <command>` },
				author: { icon_url: message.author.displayAvatarURL({ dynamic: true }), name: message.author.username }
			})
				.setColor('#FF0000')
				.setThumbnail(this.container.client.user?.displayAvatarURL({ format: 'jpeg' })!)
			// Be sure to add a space so this is offset from the page numbers!
		});

		const commands = this.container.stores.get('commands');

		let categories: string[] = [];

		for (const [_name, item] of commands) {
			categories.push(item.category!);
		}

		categories = this.removeDuplicates(categories);

		for (const category of categories) {
			paginatedMessage.addPageEmbed((embed) =>
				embed //
					.setDescription(
						commands
							.filter((c) => c.category === category)
							.map((c) => `\`${c.name}\``)
							.join(' ')
					)
					.setTitle(category)
			);
		}

		await paginatedMessage.run(response, message.author);
		return response;
	}
}
