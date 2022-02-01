import "./lib/setup";
import "./lib/oauth";
import api from "./routes/api";
import express from "express";
import session from "express-session";
import passport from "passport";
import cors from "cors";
import http from "http";

import { Server } from "socket.io";
import { UserConfig } from "./entities/user_config";
import { UserToken } from "./entities/user_token";
import { Session } from "./entities/user_session";
import { createConnection, getRepository } from "typeorm";
import { TypeormStore } from "connect-typeorm";

import { ApolloServer } from "apollo-server-express";
import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";
import { buildSchema } from "type-graphql";
import { UserResolver } from "./resolvers/user";
import { GuildResolver } from "./resolvers/guild";
import { GuildConfig } from "./entities/guild_config";
import { __prod__ } from "./lib/constants";

const app = express();
const server = http.createServer(app);

const io = new Server(server, { cors: { origin: "http://localhost:3000" } });

const main = async () => {
  const PORT = process.env.PORT || 5000;

  await createConnection({
    type: "postgres",
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT),
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE,
    synchronize: false,
    entities: [GuildConfig, UserConfig, UserToken, Session],
  })
    .then(() => console.log("Connected to POSTGRESQL database"))
    .catch((err) => {
      console.log(err.message);
      process.exit(1);
    });

  const sessionRepository = getRepository(Session);

  let interval: NodeJS.Timeout;

  io.on("connection", (socket) => {
    console.log("A client connected");

    if (interval) clearInterval(interval);

    socket.on("getSong", (data) => {
      interval = setInterval(() => socket.emit("song", data), 1000);
    });

    socket.on("disconnect", () => {
      if (interval) clearInterval(interval);
      console.log("Client disconnected");
    });
  });

  app.use(
    cors({
      origin: [process.env.DASHBOARD_URL],
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
      },
      store: new TypeormStore().connect(sessionRepository),
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
    }),
    plugins: [
      ApolloServerPluginLandingPageGraphQLPlayground({
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

  app.use("/", api);

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

export { io as websocket };
