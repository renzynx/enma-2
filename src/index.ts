import './lib/setup';
import BoatClient from 'boats.js';
import Spotify from 'better-erela.js-spotify';
import AppleMusic from 'better-erela.js-apple';
import { Manager } from 'erela.js';
import { Collection, MessageEmbed, MessageEmbedOptions } from 'discord.js';
import { container, SapphireClient } from '@sapphire/framework';
import { createConnection, getRepository } from 'typeorm';
import { GuildConfig } from './entities/guild_config';
import { Server } from 'socket.io';
import httpServer from 'http';
import { PORT } from './lib/constants';
import type { APIEmbed } from 'discord-api-types';
import type { Message } from 'discord.js';
import type { Player } from 'erela.js';
import type { DefaultEventsMap } from 'socket.io/dist/typed-events';
import type { CustomTrack } from './lib/types';

declare module '@sapphire/pieces' {
	interface Container {
		config: Collection<string, GuildConfig>;
		context: Collection<string, any>;
		current: Collection<string, CustomTrack>;
		manager: Manager;
		node: Node;
		boat: BoatClient;
		getPlayer: (message: Message) => Player | undefined;
		embed: (data?: MessageEmbed | MessageEmbedOptions | APIEmbed | undefined) => MessageEmbed;
		ws: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>;
	}
}

container.boat = new BoatClient(process.env.BOAT_TOKEN!);
container.config = new Collection();
container.context = new Collection();
container.current = new Collection();
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
		const server = httpServer.createServer();
		container.ws = new Server(server, { cors: { origin: '*' } });
		container.ws.on('connection', (socket) => {
			socket.on('playing', (data: string) => {
				const player = container.manager.players.get(data);
				if (!player) return;
				const track = container.current.get(data);
				container.ws.emit(data, track);
			});

			socket.on('playback', (data: string) => {
				const player = container.manager.players.get(data);
				if (!player) return;
				!player.paused ? player.pause(true) : player.pause(false);
			});

			socket.on('skip', (data: string) => {
				const player = container.manager.players.get(data);
				if (!player) return;
				player.stop();
			});

			socket.on('previous', (data: string) => {
				const player = container.manager.players.get(data);
				if (!player || !player.queue.previous) return;
				player.queue.unshift(player.queue.previous);
				player.stop();
			});
		});

		await createConnection({
			type: 'postgres',
			host: process.env.DATABASE_HOST,
			port: parseInt(process.env.DATABASE_PORT!),
			username: process.env.DATABASE_USERNAME,
			password: process.env.DATABASE_PASSWORD,
			database: process.env.DATABASE,
			entities: [GuildConfig],
			synchronize: process.env.NODE_ENV === 'development'
		}).then(() => client.logger.info('Connected to POSTGRESQL database'));

		const guildRepository = getRepository(GuildConfig);

		const guild = await guildRepository.find();

		guild.map((g) => container.config.set(g.guild_id, g));

		client.logger.info('Logging in');
		await client.login();
		client.logger.info('Logged in');

		server.listen(PORT, () => client.logger.info(`Server is listening on port ${PORT}`));
	} catch (error) {
		client.logger.fatal(error);
		client.destroy();
		process.exit(1);
	}
};

main();
