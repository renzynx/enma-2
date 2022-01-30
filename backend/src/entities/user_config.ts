import { Field, ObjectType } from "type-graphql";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@ObjectType()
@Entity({ name: "user_config" })
export class UserConfig {
  @Field()
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column()
  uid: string;

  @Field()
  @Column()
  user_tag: string;

  @Field()
  @Column()
  avatar: string;
}
