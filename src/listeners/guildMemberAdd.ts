import { ApplyOptions } from '@sapphire/decorators';
import { Listener, ListenerOptions } from '@sapphire/framework';
import { GuildMember, MessageAttachment, TextChannel } from 'discord.js';
import Canvas from 'canvas';
import path from 'path';

@ApplyOptions<ListenerOptions>({})
export class UserEvent extends Listener {
	public async run(member: GuildMember) {
		const config = this.container.config.get(member.guild.id);

		if (!config?.welcome_channel) return 'bruh';

		if (config?.welcome_channel) {
			const channel = this.container.client.channels.cache.get(config?.welcome_channel) as TextChannel;
			if (!channel) return 'null';

			const attachment = await this.helloGen(member);
			return channel.send({
				files: [attachment],
				content: config?.welcome_message || ''
			});
		}

		return 'fucking ts-config go die';
	}

	private applyText(canvas: Canvas.Canvas, text: string) {
		const context = canvas.getContext('2d');

		// Declare a base size of the font
		let fontSize = 70;

		do {
			// Assign the font to the context and decrement it so it can be measured again
			context.font = `${(fontSize -= 10)}px DM Sans`;
			// Compare pixel width of the text to the canvas minus the approximate avatar size
		} while (context.measureText(text).width > canvas.width - 300);

		// Return the result to use in the actual canvas
		return context.font;
	}

	private async helloGen(member: GuildMember) {
		Canvas.registerFont(path.join(__dirname, '..', '..', 'assets', 'fonts', 'DMSans-Regular.ttf'), { family: 'DM Sans' });
		const canvas = Canvas.createCanvas(1000, 400);
		const context = canvas.getContext('2d');

		const background = await Canvas.loadImage(path.join(__dirname, '..', '..', 'assets', 'images', 'nord-mountain.png'));

		context.drawImage(background, 0, 0, canvas.width, canvas.height);
		context.strokeStyle = '#0099ff';
		context.strokeRect(0, 0, canvas.width, canvas.height);

		context.font = '45px DM Sans';
		context.fillStyle = '#ffffff';
		context.fillText('Welcome to', canvas.width / 2.5, canvas.height / 3.5);
		context.fillStyle = '#f54263';
		context.fillText(`${member.guild.name}`, canvas.width / 2.5, canvas.height / 2.5);

		context.font = this.applyText(canvas, `${member.user.tag}`);
		context.fillStyle = '#ffffff';
		context.fillText(`${member.user.tag}`, canvas.width / 2.5, canvas.height / 1.3);

		context.beginPath();
		context.arc(200, 200, 150, 0, Math.PI * 2, true);
		context.closePath();
		context.clip();

		const avatar = await Canvas.loadImage(member.user.displayAvatarURL({ format: 'jpg' }));
		context.drawImage(avatar, 50, 50, 300, 300);

		const attachment = new MessageAttachment(canvas.toBuffer(), `welcome-${member.user.username}.jpg`);

		return attachment;
	}
}
