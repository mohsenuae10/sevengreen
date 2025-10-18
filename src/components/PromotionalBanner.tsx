import { Link } from "react-router-dom";

interface PromotionalBannerProps {
  bannerUrl: string;
  productSlug: string;
  offerDescription: string;
}

export const PromotionalBanner = ({ bannerUrl, productSlug, offerDescription }: PromotionalBannerProps) => {
  return (
    <Link 
      to={`/products/${productSlug}`}
      className="block w-full overflow-hidden group"
    >
      <div className="relative">
        <img 
          src={bannerUrl} 
          alt={offerDescription}
          className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
      </div>
    </Link>
  );
};
