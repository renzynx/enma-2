import { FaDiscord } from "react-icons/fa";
import { client } from "..";
import { UserQuery } from "../lib/graphql/query";
import { UserConfig } from "../lib/types";

type UserCFG = {
  user: UserConfig | null;
};

export const Login = () => {
  const nav = (route: string) => {
    return (window.location.href = route);
  };

  return (
    <div className="flex items-center justify-center w-screen min-h-screen flex-col gap-5">
      <img
        className="block h-40 w-auto rounded-full"
        src="https://cdn.discordapp.com/avatars/772690931539247104/5f0aa26a8e2b83c3d218989b3063615e.png"
        alt="enma"
      />
      <div
        onClick={async () => {
          const { data } = await client.query<UserCFG>({
            query: UserQuery,
          });

          return data.user?.uid
            ? nav("/dashboard")
            : nav("http://localhost:8080/auth/login");
        }}
        className="text-xl px-10 py-3 ring-1 ring-offset-black hover:bg-slate-800 cursor-pointer flex flex-row gap-3 rounded-md lg:hover:scale-105 duration-200 ease-linear hover:ring-red-400"
      >
        <span>Login with Discord</span>
        <span className="mt-1">
          <FaDiscord color="#7289DA" />
        </span>
      </div>
    </div>
  );
};
