import { FC } from "react";
import { GuildQueryType } from "../../lib/types";
import DiscordIcon from "../../lib/assets/discord-icon.webp";
import { useQuery } from "@apollo/client";
import { GuildQuery } from "../../lib/graphql/query";
import { BarLoader } from "react-spinners";
import { useRouter } from "next/router";
import Image from "next/image";

const Menu: FC = () => {
  const router = useRouter();
  const { data, loading, error } = useQuery<GuildQueryType>(GuildQuery);

  if (loading)
    return (
      <div className="flex w-screen flex-col items-center justify-center min-h-[90vh]">
        <p>Loading guilds...</p>
        <BarLoader loading={true} color="white" width={"200px"} />
      </div>
    );

  if (error)
    return (
      <div className="flex min-h-screen w-screen items-center justify-center bg-slate-900">
        <p className="text-2xl text-teal-400 text-center">404 Not Found</p>
      </div>
    );

  const included = data?.guilds.included;
  const excluded = data?.guilds.excluded;

  const click = (route: string) => {
    router.push(`/dashboard/${route}`);
  };

  if (!included?.length && !excluded?.length)
    return (
      <div className="flex items-center justify-center w-screen min-h-[90vh]">
        <p className="text-center text-2xl">
          Look like you don&apos;t have any guilds available
        </p>
      </div>
    );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-y-20 my-20">
      {included &&
        included.map((item, index) => (
          <div
            className="transition lg:hover:-translate-y-5 rounded-md cursor-pointer hover:shadow-2xl hover:bg-gray-700 ease-in-out duration-300 px-5 py-5 mx-auto shadow-xl bg-slate-800 ring-2 ring-black ring-opacity-5 focus:outline-none"
            key={index}
            onClick={() => click(item.id)}
          >
            <Image
              src={
                item.icon
                  ? `https://cdn.discordapp.com/icons/${item.id}/${item.icon}.webp?size=256`
                  : DiscordIcon.src
              }
              alt="guild icon"
              className="mb-4 rounded-md"
              width="197px"
              height="197px"
            />
            <p className="text-center mt-2">{item.name}</p>
          </div>
        ))}
      {excluded &&
        excluded.map((item, index) => (
          <div
            className="transition lg:hover:-translate-y-5 rounded-md cursor-pointer hover:shadow-2xl hover:bg-gray-700 ease-in-out duration-300 px-5 py-5 mx-auto shadow-xl bg-slate-800 ring-1 ring-black ring-opacity-5 focus:outline-none"
            key={index}
            onClick={() =>
              (window.location.href = process.env.REACT_APP_INVITE_URL!)
            }
          >
            <Image
              src={
                item.icon
                  ? `https://cdn.discordapp.com/icons/${item.id}/${item.icon}.webp?size=256`
                  : DiscordIcon.src
              }
              alt="guild icon"
              className="rounded-md"
              width="197px"
              height="197px"
            />
            <p className="text-center mt-2">{item.name}</p>
          </div>
        ))}
    </div>
  );
};

export { Menu as default };
