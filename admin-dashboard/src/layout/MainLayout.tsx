import { Outlet } from "react-router";
import TopBar from "../components/layout/TopBar";
import Sidebar from "../components/layout/Sidebar";

const MainLayout = () => {
  return (
    <div>
      <TopBar />
      <Outlet />
      <Sidebar />
    </div>
  );
};

export default MainLayout;
