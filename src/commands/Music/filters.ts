import { ApplyOptions } from '@sapphire/decorators';
import type { Args } from '@sapphire/framework';
import { send } from '@sapphire/plugin-editable-commands';
import { SubCommandPluginCommand, SubCommandPluginCommandOptions } from '@sapphire/plugin-subcommands';
import type { Message } from 'discord.js';

@ApplyOptions<SubCommandPluginCommandOptions>({
	description: 'A basic command',
	aliases: ['filter'],
	preconditions: ['inVoiceChannel', 'sameVoiceChannel', 'isPlaying'],
	detailedDescription:
		'`filter <option>` - Use this command without any option specified to get all options.\n Use `filter reset` to turn off filter.'
})
export class UserCommand extends SubCommandPluginCommand {
	async sleep(ms: number) {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}

	async messageRun(message: Message, args: Args) {
		const filters = await args.pick('string').catch(() => null);

		const filterList = ['8d', 'pop', 'nightcore', 'bassboost', 'vaporwave'];

		const player = this.container.getPlayer(message);

		if (!player) return;

		try {
			switch (filters) {
				case '8d':
					player.set('filter', '8d');
					await player.node.send({
						op: 'filters',
						guildId: message.guild!.id,
						rotation: {
							rotationHz: 0.2
						}
					});
					send(message, 'Applying `8d` filter...');
					await this.sleep(5000);
					return send(message, 'Filter `8d` applied!');

				case 'pop':
					player.set('filter', 'pop');
					await player.node.send({
						op: 'filters',
						guildId: message.guild!.id,
						equalizer: [
							{ band: 0, gain: 0.65 },
							{ band: 1, gain: 0.45 },
							{ band: 2, gain: -0.45 },
							{ band: 3, gain: -0.65 },
							{ band: 4, gain: -0.35 },
							{ band: 5, gain: 0.45 },
							{ band: 6, gain: 0.55 },
							{ band: 7, gain: 0.6 },
							{ band: 8, gain: 0.6 },
							{ band: 9, gain: 0.6 },
							{ band: 10, gain: 0 },
							{ band: 11, gain: 0 },
							{ band: 12, gain: 0 },
							{ band: 13, gain: 0 }
						]
					});
					send(message, 'Applying `pop` filter...');
					await this.sleep(5000);
					return send(message, 'Filter `pop` applied!');

				case 'nightcore':
					player.set('filter', 'nightcore');
					await player.node.send({
						op: 'filters',
						guildId: message.guild!.id,
						timescale: {
							speed: 1.2999999523162842,
							pitch: 1.2999999523162842,
							rate: 1
						}
					});
					send(message, 'Applying `nightcore` filter...');
					await this.sleep(5000);
					return send(message, 'Filter `nightcore` applied!');
				case 'bassboost':
					player.set('filter', 'bassboost');
					await player.node.send({
						op: 'filters',
						guildId: message.guild!.id,
						equalizer: [
							{ band: 0, gain: 0.6 },
							{ band: 1, gain: 0.67 },
							{ band: 2, gain: 0.67 },
							{ band: 3, gain: 0 },
							{ band: 4, gain: -0.5 },
							{ band: 5, gain: 0.15 },
							{ band: 6, gain: -0.45 },
							{ band: 7, gain: 0.23 },
							{ band: 8, gain: 0.35 },
							{ band: 9, gain: 0.45 },
							{ band: 10, gain: 0.55 },
							{ band: 11, gain: 0.6 },
							{ band: 12, gain: 0.55 },
							{ band: 13, gain: 0 }
						]
					});
					send(message, 'Applying `bassboost` filter...');
					await this.sleep(5000);
					return message.channel.send('Filter `bassboost` applied!');

				case 'vaporwave':
					player.set('filter', 'vaporwave');
					await player.node.send({
						op: 'filters',
						guildId: message.guild!.id,
						equalizer: [
							{ band: 1, gain: 0.3 },
							{ band: 0, gain: 0.3 }
						],
						timescale: { pitch: 0.5 },
						tremolo: { depth: 0.3, frequency: 14 }
					});
					send(message, 'Applying `vaporwave` filter...');
					await this.sleep(5000);
					return send(message, 'Filter `vaporwave` applied!');
				case 'reset':
				case 'clear':
				case 'remove':
				case 'off':
					player.set('filter', null);
					await player.node.send({
						op: 'filters',
						guildId: message.guild!.id
					});
					send(message, 'Clearing filter...');
					await this.sleep(5000);
					return send(message, 'Filter has been cleared!');
				default:
					const context = player.get<string | null>('filter');
					const eb = this.container
						.embed()
						.setAuthor({ name: message.guild?.name!, iconURL: message.guild?.iconURL()! })
						.addFields(
							filterList.map((filter) => ({
								name: filter,
								value: context === filter ? ':white_check_mark:' : ':x:',
								inline: true
							}))
						)
						.setTimestamp();
					return message.channel.send({ embeds: [eb] });
			}
		} catch (err) {
			message.channel.send(`Oh no, an error occurred. Try again later!`);
			return this.container.logger.error(err);
		}
	}
}
