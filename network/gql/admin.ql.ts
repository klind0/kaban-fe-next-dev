/** GraphQL documents for Kaban admin review */

export const ADMIN_LOGIN_MUTATION = `
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password)
  }
`;

export const PENDING_LISTINGS_QUERY = `
  query PendingListings {
    pendingListings
  }
`;

export const LISTING_FOR_REVIEW_QUERY = `
  query ListingForReview($id: String!) {
    listingForReview(id: $id)
  }
`;

export const PUBLISH_LISTING_MUTATION = `
  mutation PublishListing($id: String!) {
    publishListing(id: $id)
  }
`;

export const REJECT_LISTING_MUTATION = `
  mutation RejectListing($id: String!, $input: JSONObject!) {
    rejectListing(id: $id, input: $input)
  }
`;

export const PUBLIC_LISTINGS_FOR_ADMIN_QUERY = `
  query PublicListingsForAdmin($filter: JSONObject) {
    publicListings(filter: $filter)
  }
`;

export const SET_FEATURED_MUTATION = `
  mutation SetFeaturedListings($listingIds: [String!]!) {
    setFeaturedListings(listingIds: $listingIds)
  }
`;

export const FEATURED_LISTINGS_QUERY = `
  query FeaturedListings($limit: Float) {
    featuredListings(limit: $limit)
  }
`;

/** Rejection reasons — must match backend enum */
export const REJECT_REASONS = [
  { value: "description", label: "Poor / incomplete description" },
  { value: "price", label: "Invalid or unrealistic price" },
  { value: "details", label: "Incorrect property details" },
  { value: "image", label: "Image quality / missing images" },
  { value: "location", label: "Location issues" },
  { value: "map", label: "Map / coordinates issues" },
  { value: "duplicate", label: "Duplicate listing" },
  { value: "tos_violation", label: "Terms of service violation" },
] as const;