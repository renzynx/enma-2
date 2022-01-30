import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'guild_config' })
export class GuildConfig {
	@PrimaryGeneratedColumn()
	id!: number;

	@Column()
	guild_id!: string;

	@Column({ default: '?' })
	prefix!: string;

	@Column({ nullable: true })
	welcome_channel!: string;
}
