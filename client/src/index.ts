import './lib/setup';
import { Collection, TextChannel, MessageEmbed, MessageEmbedOptions } from 'discord.js';
import { container, LogLevel, SapphireClient } from '@sapphire/framework';
import { createConnection, getRepository } from 'typeorm';
import { GuildConfig } from './entities/guild_config';
import { io, Socket } from 'socket.io-client';
import { Manager, Player } from 'erela.js';
import type { APIEmbed } from 'discord-api-types';
import type { Message } from 'discord.js';
import Spotify from 'better-erela.js-spotify';

declare module '@sapphire/pieces' {
	interface Container {
		config: Collection<string, GuildConfig>;
		socket: Socket<any, any>;
		manager: Manager;
		getPlayer: (message: Message) => Player | undefined;
		embed: (data?: MessageEmbed | MessageEmbedOptions | APIEmbed | undefined) => MessageEmbed;
	}
}

container.config = new Collection();
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
	regexPrefix: /^(hey +)?enma[,! ]/i,
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

container.socket = io('http://localhost:8080');
container.manager = new Manager({
	nodes: [
		{
			host: process.env.LAVALINK_HOST!,
			port: parseInt(process.env.LAVALINK_PORT!),
			password: process.env.LAVALINK_PASSWORD!
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
	.on('trackStart', async (player) => {
		const channel = client.channels.cache.get(player.textChannel!) as TextChannel;
		const embed = container
			.embed({
				footer: {
					// @ts-ignore
					text: `Requested by ${player.queue.current?.requester.tag}`,
					// @ts-ignore
					icon_url: player.queue.current?.requester.displayAvatarURL({ dynamic: true })
				},
				thumbnail: {
					url: player.queue.current?.thumbnail!
				},
				description: `[${player.queue.current?.title}](${player.queue.current?.uri})`,
				author: { name: 'Now Playing', icon_url: 'https://raw.githubusercontent.com/renzynx/enma/main/assets/gif/spinMain.gif' }
			})
			.setColor('#808bed');

		if (channel) {
			const msg = await channel.send({ embeds: [embed] });
			return setTimeout(() => msg.deletable && msg.delete(), player.queue.current?.duration!);
		}

		return null;
	})
	.on('queueEnd', (player) => {
		const channel = client.channels.cache.get(player.textChannel!) as TextChannel;
		channel && channel.send('Queue has ended, i hope you enjoyed the session!');
		return player.destroy();
	});

const main = async () => {
	try {
		container.socket.on('updatePrefix', async (data: GuildConfig) => {
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
			.then(() => client.logger.info('Connected to POSTGRESQL database'))
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
