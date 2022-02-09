import { ApplyOptions } from '@sapphire/decorators';
import { SubCommandPluginCommand, SubCommandPluginCommandOptions } from '@sapphire/plugin-subcommands';
import type { Message } from 'discord.js';
import type { Args } from '@sapphire/framework';
import { getRepository } from 'typeorm';
import { GuildConfig } from '../../entities/guild_config';

@ApplyOptions<SubCommandPluginCommandOptions>({
	description: 'Make the bot stay in the voice channel 24/7.',
	requiredUserPermissions: ['MANAGE_GUILD']
})
export class UserCommand extends SubCommandPluginCommand {
	private readonly guildRepository = getRepository(GuildConfig);

	public async messageRun(message: Message, args: Args) {
		const option = await args.pick('string');

		switch (option) {
			case 'on':
			case 'enable':
			case 'true':
			case 'yes':
				await this.guildRepository.update(message.guild!.id, { stay: true });
				return message.channel.send('The bot will stay in the voice channel 24/7.');

			case 'off':
			case 'disable':
			case 'false':
			case 'no':
				await this.guildRepository.update(message.guild!.id, { stay: false });
				return message.channel.send('The bot will not stay in the voice channel 24/7.');
			default:
				return message.channel.send('Please specify whether you want the bot to stay in the voice channel 24/7.');
		}
	}
}
