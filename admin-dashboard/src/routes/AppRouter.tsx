import { createBrowserRouter } from "react-router";
import AuthLayout from "../layout/AuthLayout";
import MainLayout from "../layout/MainLayout";

const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [
      {
        path: "admin/dashboard/login",
        element: <h3>Login page</h3>,
      },
    ],
  },
  {
    path: "",
    element: <MainLayout />,
    children: [
      { path: "", element: <div>Dashboard</div> },
      { path: "/products", element: <div>Product page</div> },
    ],
  },
  {
    path: "*",
    element: <div>Not found page</div>,
  },
]);
export default router;
