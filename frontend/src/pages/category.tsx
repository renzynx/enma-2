import {
  GuildChannel,
  GuildConfig as GuildConfigQuery,
} from "../lib/graphql/query";
import { useMutation, useQuery } from "@apollo/client";
import { Navigate, useParams } from "react-router-dom";
import { lazy, Suspense } from "react";
import { GuildChannelType, GuildConfig, UserConfig } from "../lib/types";
import { updatePrefix, updateWelcomeChannel } from "../lib/graphql/mutation";
import { Loading } from "../components/layouts/Loading";
import { Prefix } from "../components/dashboard/Prefix";
import { Welcome } from "../components/dashboard/Welcome";

type Query = {
  config: GuildConfig;
};

type Channel = {
  channels: GuildChannelType[];
};

const Category = ({ user }: { user: UserConfig }) => {
  const Navbar = lazy(() => import("../components/layouts/Navbar"));

  const { id } = useParams();

  const { data, loading, error } = useQuery<Query>(GuildConfigQuery, {
    variables: { id },
  });

  const {
    data: data1,
    loading: loading1,
    error: error1,
  } = useQuery<Channel>(GuildChannel, {
    variables: { id },
  });

  const [mutatePrefix] = useMutation(updatePrefix);
  const [mutateWelcome] = useMutation(updateWelcomeChannel);

  if (loading || loading1) return <Loading />;

  if (error || error1) return <Navigate replace to="/dashboard" />;

  return data && data1 && data.config && data1.channels ? (
    <div>
      <Suspense fallback={<Loading />}>
        <Navbar user={user} />
        <div className="grid lg:grid-flow-col md:grid-flow-row gap-5 w-[80%] mx-auto my-20">
          <Prefix config={data.config} mutatePrefix={mutatePrefix} />
          <Welcome
            config={data.config}
            channels={data1.channels}
            mutateWelcome={mutateWelcome}
          />
        </div>
      </Suspense>
    </div>
  ) : (
    <Navigate replace to={"/dashboard"} />
  );
};

export { Category as default };
