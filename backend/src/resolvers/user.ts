import { Ctx, Mutation, Query, Resolver, UseMiddleware } from "type-graphql";
import { UserConfig } from "../entities/user_config";
import type { Context } from "../lib/types";
import { isAuth } from "../middleware/isAuth";

@Resolver((_of) => UserConfig)
export class UserResolver {
  @Query((_returns) => UserConfig, { nullable: true })
  user(@Ctx() { req }: Context) {
    if (req.user) return req.user;
    return null;
  }

  @Mutation((_returns) => Boolean)
  @UseMiddleware(isAuth)
  logout(@Ctx() { req }: Context) {
    req.logout();
    return true;
  }
}
