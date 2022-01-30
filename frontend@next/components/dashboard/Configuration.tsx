import { useQuery } from "@apollo/client";
import { GuildConfig } from "../../lib/graphql/query";
import { Loading } from "../layouts/Loading";
import { Prefix } from "./Prefix";
import { Welcome } from "./Welcome";
import { useRouter } from "next/router";

type ConfigType = {
  config: {
    guild_id: string;
    prefix: string;
    welcome_channel: string;
  };
};

export const Configuration = ({ params }: { params: string }) => {
  const { data, loading, error } = useQuery<ConfigType>(GuildConfig, {
    variables: { id: params },
  });

  const router = useRouter();

  if (loading) return <Loading />;

  if (error || !data!.config) return <>{router.push("/")}</>;

  return (
    <div className="grid lg:grid-flow-col md:grid-flow-row gap-5 w-[80%] mx-auto my-20">
      <Prefix config={data!.config} params={params} />
      <Welcome params={params} />
    </div>
  );
};
