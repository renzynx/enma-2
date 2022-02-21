import type { Request, Response } from "express";
import type { Server } from "socket.io";
import type { DefaultEventsMap } from "socket.io/dist/typed-events";
import { Field, Int, ObjectType } from "type-graphql";
import type { UserConfig } from "../entities/user_config";

interface Extended extends Request {
  user: UserConfig;
}

export type Context = {
  req: Extended;
  res: Response;
  websocket: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>;
};

export type PartialGuild = {
  id: string;
  name: string;
  icon: string;
  owner: boolean;
  permissions: string;
  features: string[];
};

export type GuildChannelType = {
  id: string;
  last_message_id?: string;
  type: number;
  name: string;
  position: number;
  parent_id?: string;
  topic?: string;
  guild_id: string;
  permission_overwrites: string[];
  nsfw: boolean;
  rate_limit_per_user: string;
};

@ObjectType()
class Guild {
  @Field()
  id: string;

  @Field()
  name: string;

  @Field(() => String, { nullable: true })
  icon: string;

  @Field()
  owner: boolean;

  @Field()
  permissions: string;

  @Field((_type) => [String])
  features: string[];
}

@ObjectType()
export class MutualGuild {
  @Field((_returns) => [Guild])
  included: PartialGuild[];

  @Field((_returns) => [Guild])
  excluded: PartialGuild[];
}

@ObjectType()
export class GuildChannel {
  @Field()
  id: string;

  @Field(() => String, { nullable: true })
  last_message_id: string;

  @Field(() => Int)
  type: number;

  @Field()
  name: string;

  @Field(() => Int)
  position: number;

  @Field(() => String, { nullable: true })
  parent_id?: string;

  @Field(() => String, { nullable: true })
  topic?: string;

  @Field()
  guild_id: string;

  @Field(() => [String])
  permission_overwrites: string[];

  @Field()
  nsfw: boolean;

  @Field()
  rate_limit_per_user: string;
}

ObjectType();
class User {
  @Field()
  id: string;

  @Field()
  username: string;

  @Field()
  discriminator: string;

  @Field()
  avatar: string;
}

ObjectType();
export class Track {
  @Field()
  track: string;

  @Field()
  title: string;

  @Field()
  author: string;

  @Field()
  duration: number;

  @Field()
  uri: string;

  @Field()
  thumbnail: string;

  @Field()
  isStream: boolean;

  @Field()
  isSeekable: boolean;

  @Field((_type) => User, { nullable: true })
  requester: User;
}
