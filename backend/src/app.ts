import "./lib/setup";
import "./lib/oauth";
import auth from "./routes/auth";
import express from "express";
import session from "express-session";
import passport from "passport";
import cors from "cors";
import http from "http";
import Redis from "ioredis";
import Store from "connect-redis";

import { Server } from "socket.io";
import { GuildConfig } from "./entities/guild_config";
import { UserConfig } from "./entities/user_config";
import { UserToken } from "./entities/user_token";
import { createConnection } from "typeorm";

import { ApolloServer } from "apollo-server-express";
import {
  ApolloServerPluginLandingPageGraphQLPlayground,
  ApolloServerPluginLandingPageDisabled,
} from "apollo-server-core";
import { buildSchema } from "type-graphql";
import { UserResolver } from "./resolvers/user";
import { GuildResolver } from "./resolvers/guild";
import { __prod__, PORT } from "./lib/setup";

const main = async () => {
  await createConnection({
    type: "postgres",
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT),
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE,
    synchronize: __prod__,
    entities: [GuildConfig, UserConfig, UserToken],
  })
    .then(() => console.log("Connected to POSTGRESQL database"))
    .catch((err) => {
      console.log(err.message);
      process.exit(1);
    });

  const redisClient = new Redis({
    port: parseInt(process.env.REDIS_PORT),
    host: process.env.REDIS_HOST,
    password: process.env.REDIS_PASSWORD,
  });

  const redisStore = Store(session);

  if (redisClient.status === "connecting")
    console.log("Connected to REDIS database");

  const app = express();
  const server = http.createServer(app);

  const urls = process.env.DASHBOARD_URL.split(" ");

  const io = new Server(server, {
    cors: { origin: urls },
  });

  io.on("connection", (socket) => {
    console.log("A client connected");

    socket.on("disconnect", () => {
      console.log("Client disconnected");
    });
  });

  app.use(
    cors({
      origin: urls,
      credentials: true,
    })
  );

  app.use(
    session({
      secret: process.env.COOKIE_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 60000 * 60 * 24 * 7,
        domain: __prod__ ? ".renzynx.space" : null,
      },
      store: new redisStore({ client: redisClient }),
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [UserResolver, GuildResolver],
      validate: false,
    }),
    context: ({ req, res }) => ({
      req,
      res,
      websocket: io,
    }),
    plugins: [
      __prod__
        ? ApolloServerPluginLandingPageDisabled()
        : ApolloServerPluginLandingPageGraphQLPlayground({
            settings: {
              "request.credentials": "include",
            },
          }),
    ],
  });

  await apolloServer.start();

  apolloServer.applyMiddleware({
    app,
    cors: false,
  });

  app.use("/auth", auth);

  app.use("*", (_req, res) => res.sendStatus(404));

  server.listen(PORT, () =>
    console.log(
      `API is running at ${
        process.env.NODE_ENV === "production"
          ? "https://api.renzynx.space"
          : "http://"
      }localhost:${PORT}`
    )
  );
};

main().catch((err) => {
  console.log(err);
  process.exit(1);
});
