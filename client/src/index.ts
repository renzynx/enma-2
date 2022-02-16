import './lib/setup';
import Spotify from 'better-erela.js-spotify';
import BoatClient from 'boats.js';
import { Collection, TextChannel, MessageEmbed, MessageEmbedOptions } from 'discord.js';
import { container, LogLevel, SapphireClient } from '@sapphire/framework';
import { createConnection, getRepository } from 'typeorm';
import { GuildConfig } from './entities/guild_config';
import { io, Socket } from 'socket.io-client';
import { Manager, Player } from 'erela.js';
import type { APIEmbed } from 'discord-api-types';
import type { Message } from 'discord.js';

declare module '@sapphire/pieces' {
	interface Container {
		config: Collection<string, GuildConfig>;
		context: Collection<string, any>;
		socket: Socket<any, any>;
		manager: Manager;
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
	],
	typing: true
});

container.socket = io('http://localhost:8080');
container.manager = new Manager({
	nodes: [
		{
			host: process.env.LAVALINK_HOST!,
			port: parseInt(process.env.LAVALINK_PORT!),
			password: process.env.LAVALINK_PASSWORD!,
			secure: true,
			identifier: '24GB VPS'
		}
	],
	plugins: [
		new Spotify({
			clientId: process.env.SPOTIFY_CLIENT_ID!,
			clientSecret: process.env.SPOTIFY_CLIENT_SECRET!,
			strategy: 'API'
		})
	],
	send: (id, payload) => {
		const guild = client.guilds.cache.get(id);
		if (guild) return guild.shard.send(payload);
	}
})
	.on('nodeConnect', (node) => client.logger.info(`Connected to ${node.options.identifier}`))
	.on('nodeError', (node, error) => client.logger.error(`${node.options.identifier} errored: ${error}`))
	.on('nodeDisconnect', (node) => client.logger.info(`Disconnected from ${node.options.identifier}`))
	.on('trackStart', async (player, track) => {
		const channel = client.channels.cache.get(player.textChannel!) as TextChannel;
		const embed = container
			.embed({
				footer: {
					// @ts-ignore
					text: `Requested by ${track.requester.tag}`,
					// @ts-ignore
					icon_url: track.requester.displayAvatarURL({ dynamic: true })
				},
				description: `[${track.title}](${track.uri})`,
				author: { name: 'Now Playing', icon_url: 'https://raw.githubusercontent.com/renzynx/enma/main/assets/gif/spinMain.gif' }
			})
			.setColor('#808bed');

		if (channel) {
			const msg = await channel.send({ embeds: [embed] });
			const config = container.config.get(channel.guild.id);
			return config?.delete_message ? setTimeout(() => msg.deletable && msg.delete(), player.queue.current?.duration!) : null;
		}

		return null;
	})
	.on('queueEnd', (player) => {
		const channel = client.channels.cache.get(player.textChannel!) as TextChannel;
		const config = container.config.get(channel.guild.id);
		if (config && config.stay) {
			if (player.trackRepeat) player.setTrackRepeat(false);
			if (player.queueRepeat) player.setQueueRepeat(false);
			return channel && channel.send('Queue ended');
		}
		channel && channel.send('Queue has ended, i hope you enjoyed the session!');
		container.context.delete(player.guild);
		return player.destroy();
	});

const main = async () => {
	try {
		container.socket.on('updatePrefix', async (data: GuildConfig) => {
			container.config.set(data.guild_id, data);
		});

		container.socket.on('trackQuery', async (data: any) => {
			const player = container.manager.players.get(data.id);

			if (!player) return container.socket.emit('playing', null);

			const res = await container.manager.search(data.song);

			if (!res.tracks.length) return container.socket.emit('playing', null);

			const track = res.tracks[0];

			if (!track) return container.socket.emit('playing', null);

			player.queue.add(track);

			return container.socket.emit('playing', player.queue);
		});

		await createConnection({
			type: 'postgres',
			host: process.env.DATABASE_HOST,
			port: parseInt(process.env.DATABASE_PORT!),
			username: process.env.DATABASE_USERNAME,
			password: process.env.DATABASE_PASSWORD,
			database: process.env.DATABASE,
			synchronize: true,
			entities: [GuildConfig]
		})
			.then(() => client.logger.info('Connected to POSTGRESQL database'))
			.catch((err) => client.logger.error(err));

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
