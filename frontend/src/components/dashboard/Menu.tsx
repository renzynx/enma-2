import { FC } from "react";
import { PartialGuild } from "../../lib/types";
import DiscordIcon from "../../assets/discord-icon.png";

type Guilds = {
  included: PartialGuild[];
  excluded: PartialGuild[];
  click: (id: string) => void;
};

export const Menu: FC<Guilds> = ({ included, excluded, click }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-y-20 my-20">
      {included.map((item, index) => (
        <div
          className="transition lg:hover:-translate-y-5 rounded-md cursor-pointer hover:shadow-2xl hover:bg-gray-700 ease-in-out duration-300 px-5 py-5 mx-auto shadow-xl bg-white dark:bg-slate-800 ring-2 ring-black ring-opacity-5 focus:outline-none"
          key={index}
          onClick={() => click(item.id)}
        >
          <img
            src={
              item.icon
                ? `https://cdn.discordapp.com/icons/${item.id}/${item.icon}.png?size=256`
                : DiscordIcon
            }
            alt="guild icon"
            className="w-[197px] h-[197px] mb-4 rounded-md"
          />
          <p className="text-center dark:text-gray-100">{item.name}</p>
        </div>
      ))}
      {excluded.map((item, index) => (
        <div
          className="transition lg:hover:-translate-y-5 rounded-md cursor-pointer hover:shadow-2xl hover:bg-gray-700 ease-in-out duration-300 px-5 py-5 mx-auto shadow-xl bg-white dark:bg-slate-800 ring-1 ring-black ring-opacity-5 focus:outline-none"
          key={index}
          onClick={() =>
            (window.location.href = process.env.REACT_APP_INVITE_URL!)
          }
        >
          <img
            src={
              item.icon
                ? `https://cdn.discordapp.com/icons/${item.id}/${item.icon}.png?size=256`
                : DiscordIcon
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
