import React from "react";
import ReactDOM from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

import Page from "./components/Page";
import Dashboard from "./routes/Dashboard";
import Artist from './routes/Artist';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Page><Dashboard /></Page>
  },
  {
    path: "/artist",
    element: <Page><Artist /></Page>
  }
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
