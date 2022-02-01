import {
  Arg,
  Ctx,
  Mutation,
  Query,
  Resolver,
  UseMiddleware,
} from "type-graphql";
import { getRepository } from "typeorm";
import { getBotGuilds, getGuildChannels, getUserGuilds } from "../lib/api";
import { Context, GuildChannel, MutualGuild, PartialGuild } from "../lib/types";
import { isAuth } from "../middleware/isAuth";
import { GuildConfig } from "../entities/guild_config";

@Resolver()
export class GuildResolver {
  @Query((_returns) => MutualGuild, { nullable: true })
  @UseMiddleware(isAuth)
  async guilds(@Ctx() { req }: Context) {
    const data = await Promise.all([
      getBotGuilds(),
      getUserGuilds(req.user.uid),
    ]);

    const [botGuilds, userGuilds] = data;

    const included: PartialGuild[] = [];
    const excluded: PartialGuild[] = [];

    const validGuild = userGuilds.filter(
      ({ permissions }) => (parseInt(permissions) & 0x20) === 0x20
    );

    validGuild.filter((guild) => {
      const includedGuilds = botGuilds.find((g) => g.id === guild.id);
      if (!includedGuilds) return excluded.push(guild);
      return included.push(includedGuilds);
    });

    return { included, excluded };
  }

  @Query((_returns) => GuildConfig, { nullable: true })
  @UseMiddleware(isAuth)
  async config(@Arg("id") id: string) {
    const guildRepo = getRepository(GuildConfig);

    const guildCFG = await guildRepo.findOne({ guild_id: id });

    return guildCFG;
  }

  @Query((_returns) => [GuildChannel], { nullable: true })
  @UseMiddleware(isAuth)
  async channels(@Arg("id") id: string) {
    const guildChannels = await getGuildChannels(id);

    const t = guildChannels.filter((c) => c.type === 0);

    return t;
  }

  @Mutation(() => GuildConfig, { nullable: true })
  @UseMiddleware(isAuth)
  async prefix(
    @Arg("id") id: string,
    @Arg("prefix") prefix: string,
    @Ctx() { websocket }: Context
  ) {
    const guildRepository = getRepository(GuildConfig);

    const guild = await guildRepository.findOne({ guild_id: id });

    if (guild) {
      const saved = await guildRepository.save({
        ...guild,
        prefix,
      });

      websocket.emit("updatePrefix", saved);

      return saved;
    }

    return null;
  }

  @Mutation(() => GuildConfig, { nullable: true })
  @UseMiddleware(isAuth)
  async welcome(
    @Arg("id") id: string,
    @Arg("welcome", { nullable: true }) welcome: string | null
  ) {
    const guildRepository = getRepository(GuildConfig);

    const guild = await guildRepository.findOne({ guild_id: id });

    if (guild) {
      const saved = await guildRepository.save({
        ...guild,
        welcome_channel: welcome,
      });

      return saved;
    }

    return null;
  }
}
