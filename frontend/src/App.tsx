import { useQuery } from "@apollo/client";
import { Routes, Route } from "react-router-dom";
import { Loading } from "./components/layouts/Loading";
import { UserQuery } from "./lib/graphql/query";
import { NotFound } from "./pages/404";
import { Login } from "./pages/login";
import { lazy, Suspense } from "react";
import type { UserConfig } from "./lib/types";

type Query = {
  user: UserConfig;
};

function App() {
  const Dashboard = lazy(() => import("./pages/dashboard"));
  const Category = lazy(() => import("./pages/category"));
  const { data, loading, error } = useQuery<Query>(UserQuery);

  if (loading) return <Loading />;

  return (
    <div>
      {data?.user && !error ? (
        <>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route
              path="/dashboard"
              element={
                <Suspense fallback={<Loading />}>
                  <Dashboard user={data.user} />
                </Suspense>
              }
            />
            <Route
              path="/dashboard/:id"
              element={
                <Suspense fallback={<Loading />}>
                  <Category user={data.user} />
                </Suspense>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </>
      ) : (
        <>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </>
      )}
    </div>
  );
}

export default App;
