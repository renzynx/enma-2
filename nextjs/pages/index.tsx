import { NextPage } from "next";
import { FaDiscord } from "react-icons/fa";
import { UserQuery } from "../lib/graphql/query";
import { UserConfig } from "../lib/types";
import { graphqlClient } from "./_app";
import { useRouter } from "next/router";
import Image from "next/image";
import Head from "next/head";

type UserCFG = {
  user: UserConfig | null;
};

const Login: NextPage = () => {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>Enma | Login</title>
        <meta name="description" content="Enma bot web dashboard" />
        <meta name="keywords" content="bot, discord bot, enma" />
        <meta name="author" content="renzynx" />
      </Head>
      <div className="flex items-center justify-center w-screen min-h-screen flex-col gap-5">
        <Image
          width="100px"
          height="100px"
          className="block rounded-full"
          src="https://cdn.discordapp.com/avatars/772690931539247104/5f0aa26a8e2b83c3d218989b3063615e.webp?size=256"
          alt="enma"
        />
        <div
          onClick={async (e) => {
            e.preventDefault();
            const { data } = await graphqlClient.query<UserCFG>({
              query: UserQuery,
            });

            return data.user?.uid
              ? router.replace("/dashboard")
              : router.replace(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`);
          }}
          className="text-xl px-10 py-3 ring-1 ring-offset-black hover:bg-slate-800 cursor-pointer flex flex-row gap-3 rounded-md lg:hover:scale-105 duration-200 ease-linear hover:ring-red-400"
        >
          <span>Login with Discord</span>
          <span className="mt-1">
            <FaDiscord color="#7289DA" />
          </span>
        </div>
      </div>
    </>
  );
};

export default Login;
