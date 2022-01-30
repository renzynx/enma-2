import { gql } from "@apollo/client";

export const UserQuery = gql`
  query {
    user {
      uid
      user_tag
      avatar
    }
  }
`;

export const GuildQuery = gql`
  query {
    guilds {
      included {
        id
        name
        icon
      }

      excluded {
        id
        name
        icon
        name
      }
    }
  }
`;

export const GuildConfig = gql`
  query guildConfig($id: String!) {
    config(id: $id) {
      guild_id
      welcome_channel
      prefix
    }
  }
`;

export const GuildChannel = gql`
  query guildChannel($id: String!) {
    channels(id: $id) {
      id
      name
    }
  }
`;
