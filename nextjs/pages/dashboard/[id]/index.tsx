import { GetServerSideProps, NextPage } from "next";
import { ClientOnly } from "../../../components/client/ClientOnly";
import dynamic from "next/dynamic";
import Head from "next/head";

const Navbar = dynamic(() => import("../../../components/layouts/Navbar"), {
  ssr: false,
});
const Categories = dynamic(
  () => import("../../../components/dashboard/Categories"),
  { ssr: false }
);

const Category: NextPage<{ id: string }> = ({ id }) => {
  return (
    <>
      <Head>
        <title>Enma | Configuration</title>
        <meta name="description" content="Enma dashboard configuration page" />
        <meta name="keywords" content="bot, discord bot, enma" />
        <meta name="author" content="renzynx" />
      </Head>
      <ClientOnly>
        <Navbar />
        <Categories id={id} />
      </ClientOnly>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const params = ctx.params;

  if (!params?.id)
    return {
      redirect: {
        destination: "/dashboard",
        permanent: false,
      },
    };

  return {
    props: {
      id: params?.id,
    },
  };
};

export default Category;
