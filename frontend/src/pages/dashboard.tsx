import { useQuery } from "@apollo/client";
import { Navigate, useNavigate } from "react-router-dom";
import { GuildQuery } from "../lib/graphql/query";
import { PartialGuild, UserConfig } from "../lib/types";
import { Menu } from "../components/dashboard/Menu";
import { Navbar } from "../components/layouts/Navbar";
import { BarLoader } from "react-spinners";

type GuildQueryType = {
  guilds: {
    included: PartialGuild[];
    excluded: PartialGuild[];
  };
};

const Dashboard = ({ user }: { user: UserConfig }) => {
  const { data, loading, error } = useQuery<GuildQueryType>(GuildQuery);
  const navigate = useNavigate();

  if (error) return <Navigate replace to={"/"} />;

  const handleClick = (id: string) => {
    navigate(`/dashboard/${id}`);
  };

  return (
    <>
      <Navbar user={user} />
      {loading ? (
        <div className="flex w-screen flex-col items-center justify-center min-h-[90vh]">
          <p>Loading guilds...</p>
          <BarLoader loading={true} color="white" width={"200px"} />
        </div>
      ) : (
        <Menu
          included={data?.guilds.included}
          excluded={data?.guilds.excluded}
          click={handleClick}
        />
      )}
    </>
  );
};

export { Dashboard as default };
