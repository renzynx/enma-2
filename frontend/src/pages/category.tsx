import { useQuery } from "@apollo/client";
import { Navigate, useParams } from "react-router-dom";
import { Prefix } from "../components/dashboard/Prefix";
import { Welcome } from "../components/dashboard/Welcome";
import { Loading } from "../components/layouts/Loading";
import { Navbar } from "../components/layouts/Navbar";
import { GuildConfig } from "../lib/graphql/query";

export const Category = () => {
  const { id } = useParams();

  const { data, loading, error } = useQuery(GuildConfig, {
    variables: { id },
  });

  if (loading) return <Loading />;

  if (error) return <Navigate replace to="/dashboard" />;

  return data && data.config ? (
    <div className="text-slate-800 bg-slate-900">
      <Navbar />
      <div className="grid lg:grid-flow-col md:grid-flow-row gap-5 w-[80%] mx-auto my-20">
        <Prefix config={data.config} />
        <Welcome />
      </div>
    </div>
  ) : (
    <Navigate replace to={"/dashboard"} />
  );
};
