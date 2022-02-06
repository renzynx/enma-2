import { FC } from "react";
import { useQuery } from "@apollo/client";
import { PropagateLoader } from "react-spinners";
import { GuildChannel, GuildConfig } from "../../lib/graphql/query";
import { GuildConfig as GuildCFG, GuildChannelType } from "../../lib/types";
import { ClientOnly } from "../client/ClientOnly";
import { Prefix } from "./Prefix";
import { Welcome } from "./Welcome";

const Categories: FC<{ id: string }> = ({ id }) => {
  const { data, loading, error } = useQuery<{ config: GuildCFG }>(GuildConfig, {
    variables: { id },
  });

  const {
    data: channelData,
    loading: channelLoading,
    error: channelError,
  } = useQuery<{
    channels: GuildChannelType[];
  }>(GuildChannel, { variables: { id } });

  if (loading || channelLoading)
    return (
      <div className="flex w-screen flex-col items-center justify-center min-h-[90vh]">
        <PropagateLoader loading={true} color="white" />
      </div>
    );

  if (error || channelError)
    return (
      <div className="flex min-h-screen w-screen items-center justify-center bg-slate-900">
        <p className="text-2xl text-teal-400 text-center">404 Not Found</p>
      </div>
    );

  return (
    <ClientOnly>
      <div className="grid lg:grid-flow-col md:grid-flow-row gap-5 w-[80%] mx-auto my-20">
        <Prefix config={data?.config} id={id} />
        <Welcome
          id={id}
          config={data?.config}
          channels={channelData?.channels}
        />
      </div>
    </ClientOnly>
  );
};

export { Categories as default };
