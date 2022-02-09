import { ApplyOptions } from '@sapphire/decorators';
import { SubCommandPluginCommand, SubCommandPluginCommandOptions } from '@sapphire/plugin-subcommands';
import { getRepository } from 'typeorm';
import { GuildConfig } from '../../entities/guild_config';
import type { Message } from 'discord.js';
import type { Args } from '@sapphire/framework';

@ApplyOptions<SubCommandPluginCommandOptions>({
	description: 'General configuration commands.',
	aliases: ['config', 'cfg', 'configuration', 'configs', 'configurations'],
	subCommands: ['delete', 'defaultvolume', { input: 'msg', default: true }],
	requiredUserPermissions: ['MANAGE_GUILD'],
	runIn: ['GUILD_TEXT'],
	detailedDescription: 'config `<deleteembed|defaultvolume>` `<value>` - Set config for message deletion and volume.'
})
export class UserCommand extends SubCommandPluginCommand {
	private guildRepository = getRepository(GuildConfig);

	public async msg(message: Message) {
		return message.channel.send(
			`Available options: \`deleteembed\` | \`defaultvolume\`\n Enable message delete will delete now playing embed after a song ends.`
		);
	}

	public async deleteembed(message: Message, args: Args) {
		const options = await args.pick('string').catch(() => null);

		if (!options) return message.channel.send('No options provided, available options `on` | `enable` | `off` | `disable`.');

		switch (options) {
			case 'on':
			case 'enable':
				const guildConfig = await this.guildRepository.findOne({ guild_id: message.guild!.id });

				if (!guildConfig) return message.channel.send('Something went wrong, please try again.');

				guildConfig.delete_message = true;

				await this.guildRepository.save(guildConfig!);
				this.container.config.set(message.guild!.id, guildConfig!);
				return message.channel.send(
					'Deleting messages is now enabled, you need to give me the permission **MANAGE_MESSAGE** so i can delete my own message.'
				);

			case 'off':
			case 'disable':
				const guildConfig2 = await this.guildRepository.findOne({ guild_id: message.guild!.id });
				guildConfig2
					? (guildConfig2.delete_message = false)
					: await this.guildRepository.save({ guild_id: message.guild!.id, delete_message: false });
				await this.guildRepository.save(guildConfig2!);
				this.container.config.set(message.guild!.id, guildConfig2!);
				return message.channel.send('Deleting messages is now disabled.');

			default:
				return message.channel.send('Invalid option, available options `on` | `enable` | `off` | `disable`.');
		}
	}

	public async defaultvolume(message: Message, args: Args) {
		const options = await args.pick('number').catch(() => null);

		if (!options) return message.channel.send('No options provided, available options `number`.');

		const guildConfig = await this.guildRepository.findOne({ guild_id: message.guild!.id });

		if (!guildConfig) return message.channel.send('Something went wrong, please try again.');

		if (options > 100) return message.channel.send('Volume cannot be higher than 100.');
		if (options < 1) return message.channel.send('Volume cannot be lower than 1.');

		guildConfig.volume = options;

		await this.guildRepository.save(guildConfig!);
		this.container.config.set(message.guild!.id, guildConfig!);
		return message.channel.send(`🔊   Default volume set to \`${options}%\``);
	}
}
