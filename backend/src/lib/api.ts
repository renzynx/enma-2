import axios from "axios";
import type { GuildChannelType, PartialGuild } from "./types";
import { getRepository } from "typeorm";
import { UserToken } from "../entities/user_token";

const getBotGuilds = async () => {
  const res = await axios.get<PartialGuild[]>(
    "https://discord.com/api/v9/users/@me/guilds",
    {
      headers: {
        Authorization: `Bot ${process.env.BOT_TOKEN}`,
      },
    }
  );

  return res.data;
};

const getUserGuilds = async (id: string) => {
  const tokenRepository = getRepository(UserToken);
  const userToken = await tokenRepository.findOne({ uid: id });

  const res = await axios.get<PartialGuild[]>(
    "https://discord.com/api/v9/users/@me/guilds",
    {
      headers: {
        Authorization: `Bearer ${userToken.access_token}`,
      },
    }
  );

  return res.data;
};

const getGuildChannels = async (id: string) => {
  const res = await axios.get<GuildChannelType[]>(
    `https://discord.com/api/v9/guilds/${id}/channels`,
    {
      headers: {
        Authorization: `Bot ${process.env.BOT_TOKEN}`,
      },
    }
  );

  return res.data;
};

export { getBotGuilds, getUserGuilds, getGuildChannels };
