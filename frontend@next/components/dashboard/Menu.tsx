/* eslint-disable */
import DiscordIcon from "../../assets/discord-icon.png";
import { useQuery } from "@apollo/client";
import { GuildQuery } from "../../lib/graphql/query";
import { Loading } from "../layouts/Loading";
import { PartialGuild } from "../../lib/types";
import { useRouter } from "next/router";

type NestedGuild = {
  guilds: {
    included: PartialGuild[];
    excluded: PartialGuild[];
  };
};

export const Menu = () => {
  const { data, loading } = useQuery<NestedGuild>(GuildQuery);
  const router = useRouter();

  if (loading) return <Loading />;

  const { included, excluded } = data!.guilds;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-y-20 my-20">
      {included.map((item, index) => (
        <div
          className="transition lg:hover:-translate-y-5 rounded-md cursor-pointer hover:shadow-2xl ease-in-out duration-300 px-5 py-5 mx-auto shadow-xl  bg-slate-800 ring-2 ring-black ring-opacity-5 focus:outline-none"
          key={index}
          onClick={() => router.push(`dashboard/${item.id}`)}
        >
          <img
            src={
              item.icon
                ? `https://cdn.discordapp.com/icons/${item.id}/${item.icon}.png?size=256`
                : DiscordIcon.src
            }
            alt="guild icon"
            className="w-[197px] h-[197px] mb-4 rounded-md"
          />
          <p className="text-center dark:text-gray-100">{item.name}</p>
        </div>
      ))}
      {excluded.map((item, index) => (
        <div
          className="transition lg:hover:-translate-y-5 rounded-md cursor-pointer hover:shadow-2xl ease-in-out duration-300 px-5 py-5 mx-auto shadow-xl  bg-slate-800 ring-1 ring-black ring-opacity-5 focus:outline-none"
          key={index}
          onClick={() =>
            (window.location.href =
              "https://discord.com/api/oauth2/authorize?client_id=908928792947478570&permissions=8&scope=applications.commands%20bot")
          }
        >
          <img
            src={
              item.icon
                ? `https://cdn.discordapp.com/icons/${item.id}/${item.icon}.png?size=256`
                : DiscordIcon.src
            }
            alt="guild icon"
            className="w-[197px] h-[197px] mb-4 rounded-md"
          />
          <p className="dark:text-gray-100 text-center">{item.name}</p>
        </div>
      ))}
    </div>
  );
};
