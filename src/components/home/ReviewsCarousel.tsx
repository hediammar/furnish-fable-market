
import React from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Star, StarHalf } from 'lucide-react';

// Mock data for reviews
const reviews = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "Interior Designer",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=250&q=80",
    rating: 5,
    comment: "The quality of furniture I received exceeded all my expectations. The attention to detail and craftsmanship are evident in every piece. My clients are always impressed when they see my selections from Meubles Karim."
  },
  {
    id: 2,
    name: "Michael Chen",
    role: "Homeowner",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=250&q=80",
    rating: 5,
    comment: "After searching for months for the perfect sofa, I finally found it at Meubles Karim. The customer service was exceptional, and the delivery was prompt. The sofa fits perfectly in our living room and has become the centerpiece of our home."
  },
  {
    id: 3,
    name: "Emma Thompson",
    role: "Architect",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=250&q=80",
    rating: 4.5,
    comment: "I've been recommending Meubles Karim to all my clients. Their furniture pieces are not only beautiful but also incredibly durable. The dining table I purchased two years ago still looks brand new despite daily use."
  },
  {
    id: 4,
    name: "David Wilson",
    role: "Real Estate Developer",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=250&q=80",
    rating: 5,
    comment: "We furnished an entire apartment complex with pieces from Meubles Karim, and the results were spectacular. Their team worked with us to meet our timeline and budget. The furniture has held up beautifully in our rental properties."
  }
];

const ReviewsCarousel: React.FC = () => {
  // Function to render stars based on rating
  const renderRating = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`star-${i}`} className="fill-yellow-400 text-yellow-400" size={16} />);
    }
    
    if (hasHalfStar) {
      stars.push(<StarHalf key="half-star" className="fill-yellow-400 text-yellow-400" size={16} />);
    }
    
    return stars;
  };

  return (
    <section className="py-16 bg-gradient-to-b from-white to-muted/50">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-serif font-medium mb-4">What Our Customers Say</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">Read testimonials from our satisfied customers</p>
        </div>
        
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="max-w-5xl mx-auto"
        >
          <CarouselContent>
            {reviews.map((review) => (
              <CarouselItem key={review.id} className="md:basis-1/1 lg:basis-1/2 pl-6">
                <Card className="border-none shadow-md">
                  <CardContent className="p-8">
                    <div className="flex flex-col h-full">
                      <div className="flex items-center mb-6">
                        <div className="h-12 w-12 rounded-full overflow-hidden mr-4">
                          <img src={review.avatar} alt={review.name} className="h-full w-full object-cover" />
                        </div>
                        <div>
                          <h4 className="font-medium">{review.name}</h4>
                          <p className="text-sm text-muted-foreground">{review.role}</p>
                        </div>
                      </div>
                      
                      <div className="flex mb-3">
                        {renderRating(review.rating)}
                      </div>
                      
                      <blockquote className="text-muted-foreground italic">
                        "{review.comment}"
                      </blockquote>
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="flex justify-center mt-8">
            <CarouselPrevious className="static transform-none mx-2" />
            <CarouselNext className="static transform-none mx-2" />
          </div>
        </Carousel>
      </div>
    </section>
  );
};

export default ReviewsCarousel;
