import './lib/setup';
import { container, LogLevel, SapphireClient } from '@sapphire/framework';
import { createConnection, getRepository } from 'typeorm';
import { GuildConfig } from './entities/guild_config';
import { Collection, TextChannel } from 'discord.js';
import type { Message } from 'discord.js';
import { io } from 'socket.io-client';
import { Manager, Player } from 'erela.js';

declare module '@sapphire/pieces' {
	interface Container {
		config: Collection<string, GuildConfig>;
		getPlayer: (message: Message) => Player | undefined;
		manager: Manager;
	}
}

container.config = new Collection();
container.getPlayer = (message) => container.manager.players.get(message.guild?.id!);

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
	regexPrefix: /^(hey +)?bruh[,! ]/i,
	caseInsensitiveCommands: true,
	logger: {
		level: LogLevel.Debug
	},
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
	]
});

const socket = io('http://localhost:8080');

container.manager = new Manager({
	nodes: [
		{
			host: process.env.LAVALINK_HOST!,
			port: parseInt(process.env.LAVALINK_PORT!),
			password: process.env.LAVALINK_PASSWORD!
		}
	],
	send: (id, payload) => {
		const guild = client.guilds.cache.get(id);
		if (guild) return guild.shard.send(payload);
	}
})
	.on('nodeConnect', (node) => client.logger.info(`Connected to ${node.options.identifier}`))
	.on('trackStart', async (player) => {
		const channel = client.channels.cache.get(player.textChannel!) as TextChannel;
		if (channel) return channel.send(`Now playing: ${player.queue?.current?.title}`);
		return null;
	});

const main = async () => {
	try {
		socket.on('updatePrefix', async (data: GuildConfig) => {
			container.config.set(data.guild_id, data);
		});

		await createConnection({
			type: 'postgres',
			host: process.env.DATABASE_HOST,
			port: parseInt(process.env.DATABASE_PORT!),
			username: process.env.DATABASE_USERNAME,
			password: process.env.DATABASE_PASSWORD,
			database: process.env.DATABASE,
			synchronize: false,
			entities: [GuildConfig]
		})
			.then((_) => client.logger.info('Connected to POSTGRESQL database'))
			.catch((err) => client.logger.error(err));

		const guildRepository = getRepository(GuildConfig);

		const guild = await guildRepository.find();

		guild.map((g) => container.config.set(g.guild_id, g));

		client.logger.info('Logging in');
		await client.login();
		client.logger.info('Logged in');
	} catch (error) {
		client.logger.fatal(error);
		client.destroy();
		process.exit(1);
	}
};

main();
