import passport from "passport";
import Discord from "passport-discord";
import type OAuth2Strategy from "passport-oauth2";
import { getRepository } from "typeorm";
import { UserConfig } from "../entities/user_config";
import { UserToken } from "../entities/user_token";

passport.serializeUser((user: UserConfig, done) => {
  return done(null, user.uid);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const userRepo = getRepository(UserConfig);
    const user = await userRepo.findOne({ uid: id });
    return user ? done(null, user) : done(null, null);
  } catch (error) {
    console.log(error);
    return done(error, null);
  }
});

passport.use(
  new Discord(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: process.env.CALLBACK_URL,
      scope: ["identify", "guilds"],
    },
    async (
      accessToken: string,
      refreshToken: string,
      profile: Discord.Profile,
      done: OAuth2Strategy.VerifyCallback
    ) => {
      const { id, username, discriminator, avatar } = profile;

      const configRepository = getRepository(UserConfig);
      const tokenRepository = getRepository(UserToken);

      try {
        const data = await Promise.all([
          configRepository.findOne({ uid: id }),
          tokenRepository.findOne({ uid: id }),
        ]);

        const [user, token] = data;

        if (user) {
          if (!token) {
            const newToken = tokenRepository.create({
              uid: id,
              access_token: accessToken,
              refresh_token: refreshToken,
            });

            await tokenRepository.save(newToken);
          }

          return done(null, user);
        }

        const newToken = tokenRepository.create({
          uid: id,
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        await tokenRepository.save(newToken);

        const newUser = configRepository.create({
          uid: id,
          user_tag: `${username}#${discriminator}`,
          avatar,
        });

        const savedUser = await configRepository.save(newUser);

        return done(null, savedUser);
      } catch (err) {
        console.log(err);
        return done(null, null);
      }
    }
  )
);
