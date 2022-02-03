import { NextPage } from "next";
import { ClientOnly } from "../../components/client/ClientOnly";
import { UserConfig } from "../../lib/types";
import dynamic from "next/dynamic";
import Head from "next/head";

const Navbar = dynamic(() => import("../../components/layouts/Navbar"), {
  ssr: false,
});
const Menu = dynamic(() => import("../../components/dashboard/Menu"), {
  ssr: false,
});

const Dashboard: NextPage<{
  user: UserConfig;
}> = () => {
  return (
    <>
      <Head>
        <title>Enma | Dashboard</title>
        <meta name="description" content="Enma dashboard menu" />
        <meta name="keywords" content="bot, discord bot, enma" />
        <meta name="author" content="renzynx" />
      </Head>
      <ClientOnly>
        <Navbar />
        <Menu />
      </ClientOnly>
    </>
  );
};

export default Dashboard;
