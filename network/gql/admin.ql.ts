import { gql } from 'graphql-request';

export const GET_PENDING_LISTINGS = gql`
  query getPendingListings {
    pendingListings {
      id
      title
      property_id
      price
      location {
        city
        state
      }
      images
      realtor {
        id
        name
        email
        phone
      }
      createdAt
      listing_state
    }
  }
`;

export const PUBLISH_LISTING = gql`
  mutation PublishListing($id: String!) {
    publishListing(id: $id) {
      id
      listing_state
    }
  }
`;

export const REJECT_LISTING = gql`
  mutation RejectListing($id: String!, $input: JSONObject!) {
    rejectListing(id: $id, input: $input) {
      id
      listing_state
    }
  }
`;