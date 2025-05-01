import axios from 'axios';

interface GoogleReview {
  author_name: string;
  author_url: string;
  profile_photo_url: string;
  rating: number;
  relative_time_description: string;
  text: string;
  time: number;
}

interface GooglePlaceDetails {
  result: {
    reviews: GoogleReview[];
    rating: number;
    user_ratings_total: number;
  };
}

const GOOGLE_PLACES_API_KEY = process.env.VITE_GOOGLE_PLACES_API_KEY;
const PLACE_ID = process.env.VITE_GOOGLE_PLACE_ID;

export const fetchGoogleReviews = async () => {
  try {
    const response = await axios.get<GooglePlaceDetails>(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${PLACE_ID}&fields=reviews,rating,user_ratings_total&key=${GOOGLE_PLACES_API_KEY}`
    );
    
    return {
      reviews: response.data.result.reviews,
      overallRating: response.data.result.rating,
      totalReviews: response.data.result.user_ratings_total
    };
  } catch (error) {
    console.error('Error fetching Google reviews:', error);
    return {
      reviews: [],
      overallRating: 0,
      totalReviews: 0
    };
  }
}; 