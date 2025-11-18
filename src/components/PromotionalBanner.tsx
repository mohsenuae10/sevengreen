import { Link } from "react-router-dom";
import { OptimizedImage } from "./OptimizedImage";

interface PromotionalBannerProps {
  bannerUrl: string;
  productId: string;
  offerDescription: string;
}

export const PromotionalBanner = ({ bannerUrl, productId, offerDescription }: PromotionalBannerProps) => {
  return (
    <Link 
      to={`/product/${productId}`}
      className="block w-full overflow-hidden group"
    >
      <OptimizedImage
        src={bannerUrl}
        alt={offerDescription}
        className="w-full transition-transform duration-300 group-hover:scale-105"
        aspectRatio="auto"
        width={1200}
        height={400}
        priority
      />
    </Link>
  );
};
