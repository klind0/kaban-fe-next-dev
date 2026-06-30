export const PUBLIC_LISTINGS_QUERY = `
  query PublicListings($filter: JSONObject) {
    publicListings(filter: $filter) {
      data {
        id
        title
        status
        property_category
        property_type
        cover_image
        price {
          amount
          per
        }
        location {
          address
          state
          city
        }
      }
      meta {
        total
        page
        limit
        totalPages
      }
    }
  }
`;

export const PUBLIC_INDIVIDUAL_LISTING_QUERY = `
  query PublicListing($id: String!) {
    publicListing(id: $id) {
      id
      title
      description
      status
      property_category
      property_type
      cover_image
      images {
        url
        publicId
      }
      price {
        amount
        per
      }
      location {
        address
        state
        city
        landmark
        coordinates
      }
      details {
        bedroom
        bathroom
        toilet
        living_room
        land_area
        parking_space
        furnished
        serviced
        newly_built
        year_built
        floor
        total_floors
        features
      }
    }
  }
`;

export const FEATURED_LISTINGS_QUERY = `
  query FeaturedListings($limit: Float) {
    featuredListings(limit: $limit) {
      id
      title
      cover_image
      price {
        amount
      }
    }
  }
`;

export const MY_LISTINGS_QUERY = `
  query MyListings($page: Float, $limit: Float, $search: String) {
    myListings(page: $page, limit: $limit, search: $search) {
      data {
        id
        title
        status
        property_category
        property_type
        price {
          amount
        }
      }
      meta {
        total
        page
        limit
        totalPages
      }
    }
  }
`;

// 🛠️ FIX: Uses CreateListingDto! and explicitly requests the created layout ID back
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