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
		const option = await args.pick('string').catch(() => null);

		switch (option) {
			case 'on':
			case 'enable':
			case 'true':
			case 'yes':
				const guildConfig = await this.guildRepository.findOne({ guild_id: message.guild!.id });
				if (!guildConfig) return message.channel.send('Something went wrong, please try again.');
				guildConfig.stay = true;
				await this.guildRepository.save(guildConfig!);
				return message.channel.send('The bot will stay in the voice channel 24/7.');

			case 'off':
			case 'disable':
			case 'false':
			case 'no':
				if (!guildConfig) return message.channel.send('Something went wrong, please try again.');
				guildConfig.stay = false;
				await this.guildRepository.save(guildConfig!);
				return message.channel.send('The bot will not stay in the voice channel 24/7.');
			default:
				return message.channel.send(
					'Please specify whether you want the bot to stay in the voice channel 24/7.\n Available options: `on` | `enable` | `true` | `yes` | `off` | `disable` | `false` | `no`'
				);
		}
	}
}
