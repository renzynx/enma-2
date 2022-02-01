import { useQuery } from "@apollo/client";
import { lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { Loading } from "../components/layouts/Loading";
import { Navbar } from "../components/layouts/Navbar";
import { GuildQuery } from "../lib/graphql/query";

const Menu = lazy(() => import("../components/dashboard/Menu"));

export const Dashboard = () => {
  const { data, loading } = useQuery(GuildQuery);
  const navigate = useNavigate();

  if (loading) return <Loading />;

  const handleClick = (id: string) => {
    navigate(`/dashboard/${id}`);
  };

  return (
    <Suspense fallback={<Loading />}>
      <Navbar />
      <Menu
        included={data.guilds.included}
        excluded={data.guilds.excluded}
        click={handleClick}
      />
    </Suspense>
  );
};
