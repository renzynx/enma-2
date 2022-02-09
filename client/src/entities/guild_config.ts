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

	@Column({ nullable: true })
	welcome_message!: string;

	@Column({ default: false })
	delete_message!: boolean;

	@Column({ default: 80 })
	volume!: number;

	@Column({ default: false })
	stay!: boolean;
}
