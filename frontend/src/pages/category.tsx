import { useQuery } from "@apollo/client";
import { Navigate, useParams } from "react-router-dom";
import { Loading } from "../components/layouts/Loading";
import { GuildConfig } from "../lib/graphql/query";
import { lazy, Suspense } from "react";
import { UserConfig } from "../lib/types";

const Category = ({ user }: { user: UserConfig }) => {
  const Welcome = lazy(() => import("../components/dashboard/Welcome"));
  const Prefix = lazy(() => import("../components/dashboard/Prefix"));
  const Navbar = lazy(() => import("../components/layouts/Navbar"));
  const { id } = useParams();

  const { data, loading, error } = useQuery(GuildConfig, {
    variables: { id },
  });

  if (loading) return <Loading />;

  if (error) return <Navigate replace to="/dashboard" />;

  return data && data.config ? (
    <Suspense fallback={<Loading />}>
      <div className="text-slate-800 bg-slate-900 ">
        <Navbar user={user} />
        <div className="grid lg:grid-flow-col md:grid-flow-row gap-5 w-[80%] mx-auto my-20">
          <Prefix config={data.config} />
          <Welcome />
        </div>
      </div>
    </Suspense>
  ) : (
    <Navigate replace to={"/dashboard"} />
  );
};

export { Category as default };
