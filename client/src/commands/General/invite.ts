import { ApplyOptions } from '@sapphire/decorators';
import { SubCommandPluginCommand, SubCommandPluginCommandOptions } from '@sapphire/plugin-subcommands';
import type { Message } from 'discord.js';

@ApplyOptions<SubCommandPluginCommandOptions>({
	description: 'Send the bot invite link.'
})
export class UserCommand extends SubCommandPluginCommand {
	public async messageRun(message: Message) {
		const embed = this.container.embed({
			author: { name: message.author.username, icon_url: message.author.displayAvatarURL() },
			fields: [
				{
					name: 'Invite Me',
					value: '[Click Here](https://discord.com/api/oauth2/authorize?client_id=772690931539247104&permissions=137475967040&scope=bot)',
					inline: true
				},
				{
					name: 'Support Server',
					value: '[Click Here](https://discord.gg/J7A2MYwkj7)',
					inline: true
				}
			],
			thumbnail: { url: this.container.client.user?.displayAvatarURL() },
			color: 0x00ff00,
			footer: { text: new Date().toLocaleString() }
		});
		return message.channel.send({ embeds: [embed] });
	}
}
