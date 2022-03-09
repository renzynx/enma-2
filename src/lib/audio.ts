import type { Container } from '@sapphire/pieces';
import type { TextChannel } from 'discord.js';

export function AudioSocket(container: Container) {
	container.ws.on('connection', (socket) => {
		socket.on('play', async (data: { id: string; url: string; uid: string }) => {
			const player = container.manager.players.get(data.id);
			if (!player) return;
			let res;
			try {
				const user = await container.client.users.fetch(data.uid);
				res = await container.manager.search(data.url, user);
				if (res.loadType === 'LOAD_FAILED') return;
				if (res.loadType === 'NO_MATCHES') return;
				if (res.loadType === 'PLAYLIST_LOADED') {
					player.queue.add(res.tracks);

					if (!player.playing && !player.paused && player.queue.totalSize === res.tracks.length) player.play();

					if (user) {
						const playlist = container.embed({
							author: {
								name: user.username,
								iconURL: user.displayAvatarURL({ dynamic: true })
							},
							description: `Loaded playlist **${res.playlist?.name}** with ${res.tracks.length} tracks.`,
							color: 0x00ff00,
							thumbnail: { proxy_url: res.playlist?.selectedTrack?.thumbnail! }
						});

						const channel = container.client.channels.cache.get(player.textChannel!) as TextChannel;
						return channel && channel.send({ embeds: [playlist] });
					}
					return null;
				}

				player.queue.add(res.tracks[0]);
				if (!player.playing && !player.paused && !player.queue.size) player.play();
				if (user) {
					const trackEnqueued = container.embed({
						author: {
							name: user.username,
							iconURL: user.displayAvatarURL({ dynamic: true })
						},
						description: `Enqueuing **${res.tracks[0].title}**.`,
						color: 0x00ff00
					});
					const channel = container.client.channels.cache.get(player.textChannel!) as TextChannel;
					return channel && channel.send({ embeds: [trackEnqueued] });
				}
				return null;
			} catch (error) {
				container.logger.error(error);
				return null;
			}
		});

		socket.on('playing', (data: string) => {
			let player = container.manager.players.get(data);
			if (!player) return;
			const track = container.current.get(data);
			container.ws.emit(data, { ...track, player: true, defaultVolume: player.volume });
		});

		socket.on('playback', async (data: { id: string; uid: string }) => {
			const player = container.manager.players.get(data.id);
			if (!player) return;
			const user = await container.client.users.fetch(data.uid);
			const channel = container.client.channels.cache.get(player.textChannel!) as TextChannel;

			if (!player.paused) {
				player.pause(true);
				if (user) return channel && channel.send(`${user.username} paused the music.`);
				return null;
			}

			player.pause(false);
			if (user) return channel && channel.send(`${user.username} resumed the music.`);
			return null;
		});

		socket.on('skip', async (data: { id: string; uid: string }) => {
			const player = container.manager.players.get(data.id);
			if (!player) return;
			const beforeSkip = player.queue.current?.title;
			player.stop();
			const user = await container.client.users.fetch(data.uid);
			if (user) {
				const channel = container.client.channels.cache.get(player.textChannel!) as TextChannel;
				channel && channel.send(`${user.username} skipped **${beforeSkip}**.`);
			}
		});

		socket.on('previous', async (data: { id: string; uid: string }) => {
			const player = container.manager.players.get(data.id);
			if (!player || !player.queue.previous) return;
			player.queue.unshift(player.queue.previous);
			player.stop();
			const user = await container.client.users.fetch(data.uid);
			if (user) {
				const channel = container.client.channels.cache.get(player.textChannel!) as TextChannel;
				channel && channel.send(`${user.username} skipped back to **${player.queue.previous?.title}**.`);
			}
		});

		socket.on('volume', async (data: { id: string; volume: string; uid: string }) => {
			const player = container.manager.players.get(data.id);
			if (!player) return;
			player.setVolume(parseInt(data.volume, 10));
			const user = await container.client.users.fetch(data.uid);
			if (user) {
				const channel = container.client.channels.cache.get(player.textChannel!) as TextChannel;
				channel && channel.send(`${user.username} set the volume to ${data.volume}%.`);
			}
		});

		socket.on('shuffle', async (data: { id: string; uid: string }) => {
			const { id, uid } = data;
			const player = container.manager.players.get(id);
			if (!player) return;
			player.queue.shuffle();
			const user = await container.client.users.fetch(uid);
			if (user) {
				const channel = container.client.channels.cache.get(player.textChannel!) as TextChannel;
				return channel && channel.send(`${user.username} shuffled the queue.`);
			}
			return null;
		});

		socket.on('loop', (data: { id: string; level: number }) => {
			const player = container.manager.players.get(data.id);
			if (!player) return;
			if (data.level === 0) {
				player.setTrackRepeat(false);
				player.setQueueRepeat(false);
			} else if (data.level === 1) {
				player.setQueueRepeat(false);
				player.setTrackRepeat(true);
			} else if (data.level === 2) {
				player.setTrackRepeat(false);
				player.setQueueRepeat(true);
			}
		});
	});
}
