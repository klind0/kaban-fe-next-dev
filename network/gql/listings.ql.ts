export const PUBLIC_LISTINGS_QUERY = `
  query PublicListings($filter: JSONObject) {
    publicListings(filter: $filter)
  }
`;

export const PUBLIC_INDIVIDUAL_LISTING_QUERY = `
  query PublicListing($id: String!) {
    publicListing(id: $id)
  }
`;

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

// 🏗️ RULE: This expects CreateListingDto! and must request subfields { id }
export const CREATE_LISTING_MUTATION = `
  mutation CreateListing($input: CreateListingDto!, $submit: Boolean) {
    createListing(input: $input, submit: $submit) {
      id
    }
  }
`;

export const SUBMIT_LISTING_MUTATION = `
  mutation SubmitListing($id: String!) {
    submitListing(id: $id)
  }
`;

export const DELETE_LISTING_MUTATION = `
  mutation DeleteListing($id: String!) {
    deleteListing(id: $id) 
  }
`;

export const SET_FEATURED_LISTINGS_MUTATION = `
  mutation SetFeaturedListings($listingIds: [String!]!) {
    setFeaturedListings(listingIds: $listingIds)
  }
`;