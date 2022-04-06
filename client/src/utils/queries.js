import { gql } from "@apollo/client";

export const GET_ME = gql`
  query me($username: String!) {
    me(username: $username) {
      _id
      username
      email
      bookCount
      savedBook {
        title
        authors
        description
        bookId
        image
        link
      }
    }
  }
`;
