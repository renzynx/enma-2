import { useQuery } from "@apollo/client";
import { GuildConfig } from "../../lib/graphql/query";
import { Loading } from "../layouts/Loading";
import { Prefix } from "./Prefix";
import { Welcome } from "./Welcome";

type ConfigType = {
  config: {
    guild_id: string;
    prefix: string;
    welcome_channel: string;
  };
};

export const Configuration = ({ params }: { params: string }) => {
  const { data, loading } = useQuery<ConfigType>(GuildConfig, {
    variables: { id: params },
  });

  console.log(data);

  if (loading) return <Loading />;

  return (
    <div className="grid lg:grid-flow-col md:grid-flow-row gap-5 w-[80%] mx-auto my-20">
      <Prefix config={data!.config} params={params} />
      <Welcome params={params} />
    </div>
  );
};
