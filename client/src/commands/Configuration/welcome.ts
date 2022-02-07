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
	detailedDescription: 'welcome set #channel.',
	requiredUserPermissions: ['MANAGE_GUILD']
})
export class UserCommand extends SubCommandPluginCommand {
	private readonly guildRepository = getRepository(GuildConfig);

	public async run(message: Message) {
		return message.channel.send('No options provided, available options `set` | `remove`.');
	}

	public async set(message: Message, args: Args) {
		const guildConfig = await this.guildRepository.findOne({ guild_id: message.guild!.id });

		if (!guildConfig) return;

		let channel = await args.pick('guildTextChannel').catch(() => null);

		if (channel) {
			guildConfig.welcome_channel = channel.id;
			await this.guildRepository.save(guildConfig);
			this.container.config.set(message.guild!.id, guildConfig);
			return message.channel.send(`Welcome channel set to ${channel.toString()}`);
		}

		if (!channel) {
			const channelID = await args.pick('string').catch(() => null);

			if (!channelID) return message.channel.send('Please provide a channel or channel ID.');

			if (channel) {
				const check = message.guild?.channels.cache.get(channelID!);
				if (!check) return message.channel.send('That is not a valid channel.');

				guildConfig.welcome_channel = check.id;
				await this.guildRepository.save(guildConfig);
				this.container.config.set(message.guild!.id, guildConfig);
				return message.channel.send(`Welcome channel set to ${channel}`);
			}
		}

		return null;
	}

	public async remove(message: Message) {
		const guildConfig = await this.guildRepository.findOne({ guild_id: message.guild!.id });

		if (!guildConfig) return;

		guildConfig.welcome_channel = null!;
		await this.guildRepository.save(guildConfig);
		this.container.config.set(message.guild!.id, guildConfig);
		return message.channel.send('Welcome channel removed.');
	}
}
