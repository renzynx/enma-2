import { Field, Int, ObjectType } from "type-graphql";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@ObjectType()
@Entity({ name: "guild_config" })
export class GuildConfig {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column()
  guild_id: string;

  @Field()
  @Column({ default: "?" })
  prefix: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  welcome_channel?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  welcome_message!: string;

  @Field()
  @Column({ default: false })
  delete_message!: boolean;

  @Field()
  @Column({ default: 80 })
  volume!: number;

  @Field(() => [String], { nullable: true })
  @Column({ nullable: true })
  ignored_channels!: string[];
}
