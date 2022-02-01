import { useQuery } from "@apollo/client";
import { Routes, Route } from "react-router-dom";
import { Loading } from "./components/layouts/Loading";
import { UserQuery } from "./lib/graphql/query";
import { NotFound } from "./pages/404";
import { Category } from "./pages/category";
import { Dashboard } from "./pages/dashboard";
import { Login } from "./pages/login";
import type { UserConfig } from "./lib/types";

type Query = {
  user: UserConfig;
};

function App() {
  const { data, loading, error } = useQuery<Query>(UserQuery);

  if (loading) return <Loading />;

  return (
    <div>
      {data?.user && !error ? (
        <>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard user={data.user} />} />
            <Route
              path="/dashboard/:id"
              element={<Category user={data.user} />}
            />
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
