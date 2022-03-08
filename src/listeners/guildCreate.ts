import { ApplyOptions } from '@sapphire/decorators';
import { Listener, ListenerOptions } from '@sapphire/framework';
import type { Guild } from 'discord.js';
import { getRepository } from 'typeorm';
import { GuildConfig } from '../entities/guild_config';

@ApplyOptions<ListenerOptions>({})
export class UserEvent extends Listener {
	private readonly guildRepository = getRepository(GuildConfig);
	public async run(guild: Guild) {
		if (this.container.client.id === '772690931539247104')
			this.container.boat.postStats(this.container.client.guilds.cache.size, '772690931539247104');
		const config = await this.guildRepository.findOne({ guild_id: guild.id });

		if (config) {
			console.log('Found');
			return this.container.config.set(guild.id, config);
		} else {
			console.log('No Guild Found, Creating A New Record...');
			const newConfig = this.guildRepository.create({ guild_id: guild.id });
			const savedConfig = await this.guildRepository.save(newConfig);
			return this.container.config.set(guild.id, savedConfig);
		}
	}
}