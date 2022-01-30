import { useQuery } from "@apollo/client";
import { ClientOnly } from "../../components/ClientOnly";
import { Configuration } from "../../components/dashboard/Configuration";
import { Prefix } from "../../components/dashboard/Prefix";
import { Welcome } from "../../components/dashboard/Welcome";
import { Loading } from "../../components/layouts/Loading";
import { Navbar } from "../../components/layouts/Navbar";
import { GuildConfig } from "../../lib/graphql/query";

type Params = {
  id: string;
};

const Category = ({ params }: { params: Params }) => {
  const { id } = params;

  return (
    <ClientOnly>
      <Navbar />
      <Configuration params={id} />
    </ClientOnly>
  );
};

export const getServerSideProps = async ({ params }: { params: Params }) => {
  if (!params.id)
    return {
      redirect: "/dashboard",
      permanent: false,
    };

  return {
    props: {
      params,
    },
  };
};

export default Category;
