import { useQuery } from "@apollo/client";
import { Routes, Route } from "react-router-dom";
import { Loading } from "./components/layouts/Loading";
import { UserQuery } from "./lib/graphql/query";
import { Category } from "./pages/category";
import { Dashboard } from "./pages/dashboard";
import { Login } from "./pages/login";

function App() {
  const { data, loading, error } = useQuery(UserQuery);

  if (loading) return <Loading />;

  return (
    <div>
      {data.user && !error ? (
        <>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/:id" element={<Category />} />
          </Routes>
        </>
      ) : (
        <>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="*" element={<p>Not Found</p>} />
          </Routes>
        </>
      )}
    </div>
  );
}

export default App;
