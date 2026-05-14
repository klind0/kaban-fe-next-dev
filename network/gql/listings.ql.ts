export const PUBLIC_LISTINGS_QUERY = `
  query PublicListings($filter: JSONObject) {
    publicListings(filter: $filter)
  }
`;
// variables example:
// { filter: { status: "approved", type: "sale" } }

export const PUBLIC_INDIVIDUAL_LISTING_QUERY = `
  query PublicListing($id: String!) {
    publicListing(id: $id)
  }
`;

// variables: { id: "listing_id_here" }

export const FEATURED_LISTINGS_QUERY = `
  query FeaturedListings($limit: Float) {
    featuredListings(limit: $limit)
  }
`;

export const MY_LISTINGS_QUERY = `
  query MyListings($page: Float, $limit: Float, $search: String) {
    myListings(page: $page, limit: $limit, search: $search)
  }
`;

// create listing mutation
export const CREATE_LISTING_MUTATION = `
  mutation CreateListing($input: JSONObject!, $submit: Boolean) {
    createListing(input: $input, submit: $submit)
  }
`;

export const SUBMIT_LISTING_MUTATION = `
  mutation SubmitListing($id: String!) {
    submitListing(id: $id)
  }
`;
