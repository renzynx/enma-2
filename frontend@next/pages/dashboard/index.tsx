import { Menu } from "../../components/dashboard/Menu";
import { Navbar } from "../../components/layouts/Navbar";
import { ClientOnly } from "../../components/ClientOnly";

const Dashboard = () => {
  return (
    <ClientOnly>
      <Navbar />
      <Menu />
    </ClientOnly>
  );
};

export default Dashboard;
