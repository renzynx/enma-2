import { ApplyOptions } from '@sapphire/decorators';
import { SubCommandPluginCommand, SubCommandPluginCommandOptions } from '@sapphire/plugin-subcommands';
import { send } from '@sapphire/plugin-editable-commands';
import { getRepository } from 'typeorm';
import { GuildConfig } from '../../entities/guild_config';
import type { Message } from 'discord.js';
import type { Args } from '@sapphire/framework';

@ApplyOptions<SubCommandPluginCommandOptions>({
	description: 'Set the prefix for this server.',
	detailedDescription: 'prefix `<newPrefix>` - This command will set the prefix for this server. You can also use `hey enma` as a prefix.',
	cooldownDelay: 5000,
	preconditions: ['GuildOnly'],
	requiredUserPermissions: ['MANAGE_GUILD']
})
export class UserCommand extends SubCommandPluginCommand {
	private readonly guildRepository = getRepository(GuildConfig);
	public async messageRun(message: Message, args: Args) {
		const newPrefix = await args.pick('string').catch(() => null);

		if (!newPrefix) return send(message, 'Please enter a prefix!');

		if (newPrefix.length > 5) return send(message, 'The prefix cannot be longer than 5 characters!');

		const guild = await this.guildRepository.findOne({ guild_id: message.guild!.id });

		if (!guild) {
			const newGuild = this.guildRepository.create({ guild_id: message.guild!.id, prefix: newPrefix });
			await this.guildRepository.save(newGuild);
			this.container.config.set(message.guild!.id, newGuild);
			return send(message, `Prefix set to \`${newPrefix}\``);
		}

		guild.prefix = newPrefix;
		await this.guildRepository.save(guild);
		this.container.config.set(message.guild!.id, guild);
		return send(message, `Prefix set to \`${newPrefix}\``);
	}
}
