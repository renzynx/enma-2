import { Menu } from "../../components/dashboard/Menu";
import { Navbar } from "../../components/layouts/Navbar";
import { ClientOnly } from "../../components/ClientOnly";

const Dashboard = () => {
  return (
    <div>
      <ClientOnly>
        <Navbar />
        <Menu />
      </ClientOnly>
    </div>
  );
};

export default Dashboard;
