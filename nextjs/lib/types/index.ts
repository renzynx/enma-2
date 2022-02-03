export type UserConfig = {
  uid: string;
  user_tag: string;
  avatar: string;
};

export type PartialGuild = {
  id: string;
  name: string;
  icon: string;
  owner: boolean;
  permissions: string;
  features: string[];
};

export type GuildConfig = {
  guild_id: string;
  prefix: string;
  welcome_channel: string;
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

export type GuildQueryType = {
  guilds: {
    included?: PartialGuild[];
    excluded?: PartialGuild[];
  };
};

export type UserQueryType = {
  user: UserConfig;
};

export type GuildConfigType = {
  config: GuildConfig;
};
