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
}
