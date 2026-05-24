import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import Layout from "./layouts/Layout";
import Dashboard from "./pages/dashboard";
import Marche from "./pages/gestion-marche";
import Finance from "./pages/gestion-loi-finance";
import Agenda from "./pages/agenda";
import Map from "./pages/mappage";
import Login from "./pages/login";

function hasToken() {
  return Boolean(localStorage.getItem("token"));
}

function ProtectedLayout() {
  if (!hasToken()) return <Navigate to="/login" replace />;
  return <Layout />;
}

const router = createBrowserRouter([
  { path: "/", element: <Navigate to={hasToken() ? "/dashboard" : "/login"} replace /> },
  { path: "/login", element: <Login /> },
  {
    element: <ProtectedLayout />,
    children: [
      { path: "/dashboard",           element: <Dashboard /> },
      { path: "/gestion-marche",      element: <Marche /> },
      { path: "/gestion-loi-finance", element: <Finance /> },
      { path: "/agenda",              element: <Agenda /> },
      { path: "/map",                 element: <Map /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
