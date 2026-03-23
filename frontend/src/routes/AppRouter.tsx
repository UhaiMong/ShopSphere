import { createBrowserRouter } from "react-router";
import Mainlayout from "../layout/Mainlayout";
import AuthLayout from "../layout/AuthLayout";

const router = createBrowserRouter([
  //   Auth route
  {
    element: <AuthLayout />,
    children: [
      {
        path: "login",
        element: <div>Login page</div>,
      },
      {
        path: "register",
        element: <div>Registration page</div>,
      },
    ],
  },
  // Main route
  {
    element: <Mainlayout />,
    children: [
      {
        path: "",
        element: <div>Home page</div>,
      },
      {
        path: "/product",
        element: <div>Product page</div>,
      },
      {
        path: "/profile",
        element: <div>Profile page</div>,
      },
    ],
  },
  { path: "*", element: <div>Not Found</div> },
]);

export default router;
