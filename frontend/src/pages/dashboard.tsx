import { useQuery } from "@apollo/client";
import { Navigate, useNavigate } from "react-router-dom";
import { Menu } from "../components/dashboard/Menu";
import { Loading } from "../components/layouts/Loading";
import { Navbar } from "../components/layouts/Navbar";
import { GuildQuery } from "../lib/graphql/query";

export const Dashboard = () => {
  const { data, loading, error } = useQuery(GuildQuery);
  const navigate = useNavigate();

  if (loading) return <Loading />;

  if (error) return <Navigate replace to={"/"} />;

  const handleClick = (id: string) => {
    navigate(`/dashboard/${id}`);
  };

  return (
    <div className="bg-slate-900">
      <Navbar />
      <Menu
        included={data.guilds.included}
        excluded={data.guilds.excluded}
        click={handleClick}
      />
    </div>
  );
};
