import { useQuery } from "@apollo/client";
import { lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { Loading } from "../components/layouts/Loading";
import { GuildQuery } from "../lib/graphql/query";
import { UserConfig } from "../lib/types";

const Menu = lazy(() => import("../components/dashboard/Menu"));
const Navbar = lazy(() => import("../components/layouts/Navbar"));

export const Dashboard = ({ user }: { user: UserConfig }) => {
  const { data, loading } = useQuery(GuildQuery);
  const navigate = useNavigate();

  if (loading) return <Loading />;

  const handleClick = (id: string) => {
    navigate(`/dashboard/${id}`);
  };

  return (
    <Suspense fallback={<Loading />}>
      <Navbar user={user} />
      <Menu
        included={data.guilds.included}
        excluded={data.guilds.excluded}
        click={handleClick}
      />
    </Suspense>
  );
};
