import './lib/setup';
import BoatClient from 'boats.js';
import Spotify from 'better-erela.js-spotify';
import AppleMusic from 'better-erela.js-apple';
import { Manager } from 'erela.js';
import { Collection, MessageEmbed, MessageEmbedOptions } from 'discord.js';
import { container, SapphireClient } from '@sapphire/framework';
import { createConnection, getRepository } from 'typeorm';
import { GuildConfig } from './entities/guild_config';
import type { APIEmbed } from 'discord-api-types';
import type { Message } from 'discord.js';
import type { Player } from 'erela.js';

declare module '@sapphire/pieces' {
	interface Container {
		config: Collection<string, GuildConfig>;
		context: Collection<string, any>;
		manager: Manager;
		node: Node;
		boat: BoatClient;
		getPlayer: (message: Message) => Player | undefined;
		embed: (data?: MessageEmbed | MessageEmbedOptions | APIEmbed | undefined) => MessageEmbed;
	}
}

container.boat = new BoatClient(process.env.BOAT_TOKEN!);
container.config = new Collection();
container.context = new Collection();
container.getPlayer = (message) => container.manager.players.get(message.guild?.id!);
container.embed = (data) => new MessageEmbed(data);

const client = new SapphireClient({
	fetchPrefix: async (msg: Message) => {
		const guildCfg = container.config.get(msg.guild?.id!);

		if (msg.guild) {
			if (!guildCfg) {
				const newGuildRepo = getRepository(GuildConfig);
				const newGuildConfig = newGuildRepo.create({
					guild_id: msg.guild.id
				});
				await newGuildRepo.save(newGuildConfig);
				container.config.set(msg.guild.id, newGuildConfig);

				return newGuildConfig.prefix;
			}
		}

		return guildCfg?.prefix!;
	},
	presence: { activities: [{ name: 'to Enma, help', type: 'LISTENING' }] },
	regexPrefix: /^(hey +)?Enma[,! ]/i,
	caseInsensitiveCommands: true,
	shards: 'auto',
	intents: [
		'GUILDS',
		'GUILD_MEMBERS',
		'GUILD_BANS',
		'GUILD_EMOJIS_AND_STICKERS',
		'GUILD_VOICE_STATES',
		'GUILD_MESSAGES',
		'GUILD_MESSAGE_REACTIONS',
		'DIRECT_MESSAGES',
		'DIRECT_MESSAGE_REACTIONS'
	],
	typing: true
});

container.manager = new Manager({
	nodes: [
		{
			host: process.env.LAVALINK_HOST!,
			port: parseInt(process.env.LAVALINK_PORT!),
			password: process.env.LAVALINK_PASSWORD!,
			identifier: '24GB VPS',
			requestTimeout: 5000,
			retryAmount: 100,
			retryDelay: 3000
		}
	],
	plugins: [
		new Spotify({
			clientId: process.env.SPOTIFY_CLIENT_ID!,
			clientSecret: process.env.SPOTIFY_CLIENT_SECRET!,
			strategy: 'API'
		}),
		new AppleMusic()
	],
	send: (id, payload) => {
		const guild = client.guilds.cache.get(id);
		if (guild) return guild.shard.send(payload);
	}
});

const main = async () => {
	try {
		await createConnection({
			type: 'postgres',
			host: process.env.DATABASE_HOST,
			port: parseInt(process.env.DATABASE_PORT!),
			username: process.env.DATABASE_USERNAME,
			password: process.env.DATABASE_PASSWORD,
			database: process.env.DATABASE,
			entities: [GuildConfig],
			synchronize: process.env.NODE_ENV === 'production' ? false : true
		}).then(() => client.logger.info('Connected to POSTGRESQL database'));

		const guildRepository = getRepository(GuildConfig);

		const guild = await guildRepository.find();

		guild.map((g) => container.config.set(g.guild_id, g));

		client.logger.info('Logging in');
		await client.login();
		client.logger.info('Logged in');

		if (client.user?.id! === '772690931539247104') container.boat.postStats(client.guilds.cache.size, '772690931539247104');
	} catch (error) {
		client.logger.fatal(error);
		client.destroy();
		process.exit(1);
	}
};

main();
