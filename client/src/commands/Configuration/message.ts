import { ApplyOptions } from '@sapphire/decorators';
import type { Args } from '@sapphire/framework';
import { SubCommandPluginCommand, SubCommandPluginCommandOptions } from '@sapphire/plugin-subcommands';
import type { Message } from 'discord.js';
import { getRepository } from 'typeorm';
import { GuildConfig } from '../../entities/guild_config';

@ApplyOptions<SubCommandPluginCommandOptions>({
	description: 'Set the welcome channel for the server.',
	preconditions: ['GuildOnly'],
	subCommands: ['set', 'remove', { input: 'run', default: true }],
	detailedDescription: 'welcome set Hello {user} welcome to {guild} - {user} will mention the joined user, {guild} display guild name.',
	requiredUserPermissions: ['MANAGE_GUILD']
})
export class UserCommand extends SubCommandPluginCommand {
	private readonly guildRepository = getRepository(GuildConfig);

	public async run(message: Message) {
		return message.channel.send('No options provided, available options `set` | `remove`.');
	}

	public async set(message: Message, args: Args) {
		const guildConfig = await this.guildRepository.findOne({ guild_id: message.guild!.id });

		const welcome_message = await args.rest('string').catch(() => null);

		if (!guildConfig) return;

		if (message) {
			guildConfig.welcome_message = welcome_message!;
			await this.guildRepository.save(guildConfig);
			this.container.config.set(message.guild!.id, guildConfig);
			return message.channel.send(`Welcome message set to **${message}**`);
		}

		return null;
	}

	public async remove(message: Message) {
		const guildConfig = await this.guildRepository.findOne({ guild_id: message.guild!.id });

		if (!guildConfig) return;

		guildConfig.welcome_message = null!;
		await this.guildRepository.save(guildConfig);
		this.container.config.set(message.guild!.id, guildConfig);
		return message.channel.send('Welcome message removed.');
	}
}
