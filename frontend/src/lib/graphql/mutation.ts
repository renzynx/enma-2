import { gql } from "@apollo/client";

export const updatePrefix = gql`
  mutation Prefix($id: String!, $prefix: String!) {
    prefix(id: $id, prefix: $prefix) {
      prefix
    }
  }
`;

export const updateWelcomeChannel = gql`
  mutation Welcome($id: String!, $welcome: String) {
    welcome(id: $id, welcome: $welcome) {
      welcome_channel
    }
  }
`;

export const logOutMutation = gql`
  mutation LogOut {
    logout
  }
`;
