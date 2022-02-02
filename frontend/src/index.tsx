import "./index.css";
import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { BrowserRouter as Router } from "react-router-dom";
import { ApolloClient, InMemoryCache, ApolloProvider } from "@apollo/client";
import * as serviceWorkerRegistration from "./serviceWorkerRegistration";

export const client = new ApolloClient({
  uri: `${process.env.REACT_APP_API_URL}/graphql`,
  credentials: "include",
  cache: new InMemoryCache(),
});

ReactDOM.render(
  <React.StrictMode>
    <Router>
      <ApolloProvider client={client}>
        <App />
      </ApolloProvider>
    </Router>
  </React.StrictMode>,
  document.getElementById("root")
);

serviceWorkerRegistration.register();
