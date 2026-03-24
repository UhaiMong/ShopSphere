import { Outlet } from "react-router";

const AuthLayout = () => {
  return (
    <div>
      <h1>Loging page design here..</h1>
      <Outlet />
    </div>
  );
};

export default AuthLayout;
