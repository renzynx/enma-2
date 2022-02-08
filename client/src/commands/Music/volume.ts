import { ApplyOptions } from '@sapphire/decorators';
import type { Args } from '@sapphire/framework';
import { SubCommandPluginCommand, SubCommandPluginCommandOptions } from '@sapphire/plugin-subcommands';
import type { Message } from 'discord.js';

@ApplyOptions<SubCommandPluginCommandOptions>({
	description: 'Set the volume of the music player.',
	aliases: ['volume', 'vol'],
	preconditions: ['inVoiceChannel', 'sameVoiceChannel', 'isPlaying']
})
export class UserCommand extends SubCommandPluginCommand {
	public async messageRun(message: Message, args: Args) {
		const player = this.container.getPlayer(message);

		if (!player) return;

		const volume = await args.pick('number').catch(() => null);

		if (volume) {
			if (volume > 100) return message.channel.send('❌  The volume cannot be higher than 100.');
			if (volume < 1) return message.channel.send('❌  The volume cannot be lower than 1.');

			player.setVolume(volume);
			return message.channel.send(`🔊  Volume set to \`${volume}%\``);
		}

		return message.channel.send('❌  You must specify a volume (0-100).');
	}
}
