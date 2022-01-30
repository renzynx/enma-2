import { Ctx, Query, Resolver } from "type-graphql";
import { UserConfig } from "../entities/user_config";
import type { Context } from "../lib/types";

@Resolver((_of) => UserConfig)
export class UserResolver {
  @Query((_returns) => UserConfig, { nullable: true })
  user(@Ctx() { req }: Context) {
    if (req.user) return req.user;
    return null;
  }
}
