import { useQuery } from "@apollo/client";
import { lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { Loading } from "../components/layouts/Loading";
import { GuildQuery } from "../lib/graphql/query";
import { UserConfig } from "../lib/types";
import { Menu } from "../components/dashboard/Menu";

const Dashboard = ({ user }: { user: UserConfig }) => {
  const Navbar = lazy(() => import("../components/layouts/Navbar"));
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

export { Dashboard as default };
