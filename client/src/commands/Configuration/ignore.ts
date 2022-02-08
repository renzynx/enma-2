import { ApplyOptions } from '@sapphire/decorators';
import type { Args } from '@sapphire/framework';
import { SubCommandPluginCommand, SubCommandPluginCommandOptions } from '@sapphire/plugin-subcommands';
import type { Message } from 'discord.js';
import { getRepository } from 'typeorm';
import { GuildConfig } from '../../entities/guild_config';

@ApplyOptions<SubCommandPluginCommandOptions>({
	description: 'This command will make the bot ignore a certain channel.',
	aliases: ['ignore', 'ign'],
	detailedDescription: 'ignore <channel>',
	requiredUserPermissions: ['MANAGE_GUILD'],
	subCommands: ['add', 'remove', { input: 'run', default: true }]
})
export class UserCommand extends SubCommandPluginCommand {
	private guildRepository = getRepository(GuildConfig);

	public async run(message: Message) {
		return message.channel.send('No options provided, available options `add` | `remove`.');
	}

	public async add(message: Message, args: Args) {
		try {
			const guildConfig = await this.guildRepository.findOne({ guild_id: message.guild!.id });

			if (!guildConfig) return;

			let channel = await args.pick('guildTextChannel').catch(() => null);

			if (channel) {
				guildConfig.ignored_channels.push(channel.id);
				await this.guildRepository.save(guildConfig);
				this.container.config.set(message.guild!.id, guildConfig);
				return message.channel.send(`Channel ${channel.toString()} has been added to the ignored channels.`);
			}

			if (!channel) {
				const channelID = await args.pick('string').catch(() => null);

				if (!channelID) return message.channel.send('Please provide a channel or channel ID.');

				const check = message.guild?.channels.cache.get(channelID!);

				if (!check) return message.channel.send('That is not a valid channel.');

				guildConfig.ignored_channels.push(check.id);
				await this.guildRepository.save(guildConfig);
				this.container.config.set(message.guild!.id, guildConfig);
				return message.channel.send(`Channel ${channel} has been added to the ignored channels.`);
			}

			return null;
		} catch {
			return message.channel.send('Something went wrong.');
		}
	}

	public async remove(message: Message, args: Args) {
		try {
			const guildConfig = await this.guildRepository.findOne({ guild_id: message.guild!.id });

			if (!guildConfig) return;

			let channel = await args.pick('guildTextChannel').catch(() => null);

			if (channel) {
				guildConfig.ignored_channels.splice(guildConfig.ignored_channels.indexOf(channel.id), 1);
				await this.guildRepository.save(guildConfig);
				this.container.config.set(message.guild!.id, guildConfig);
				return message.channel.send(`Channel ${channel.toString()} has been removed from the ignored channels.`);
			}

			if (!channel) {
				const channelID = await args.pick('string').catch(() => null);

				if (!channelID) return message.channel.send('Please provide a channel or channel ID.');

				const check = message.guild?.channels.cache.get(channelID!);

				if (!check) return message.channel.send('That is not a valid channel.');

				guildConfig.ignored_channels.splice(guildConfig.ignored_channels.indexOf(check.id), 1);
				await this.guildRepository.save(guildConfig);
				this.container.config.set(message.guild!.id, guildConfig);
				return message.channel.send(`Channel ${channel} has been removed from the ignored channels.`);
			}

			return null;
		} catch {
			return message.channel.send('Something went wrong.');
		}
	}
}
