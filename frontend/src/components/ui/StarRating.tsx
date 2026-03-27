import { cn } from "@/utils/cn";
import { getStarArray } from "@/utils/product";

// STAR RATING
interface StarRatingProps {
  rating: number;
  reviewCount?: number;
  size?: "sm" | "md";
  showCount?: boolean;
}

export const StarRating = ({
  rating,
  reviewCount,
  size = "sm",
  showCount = true,
}: StarRatingProps) => {
  const stars = getStarArray(rating);
  const starSize = size === "sm" ? "w-3.5 h-3.5" : "w-4.5 h-4.5";

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {stars.map((fill, i) => (
          <svg
            key={i}
            className={cn(
              starSize,
              fill > 0 ? "text-amber-400" : "text-stone-200",
            )}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            {fill === 0.5 ? (
              <>
                <defs>
                  <linearGradient id={`half-${i}`}>
                    <stop offset="50%" stopColor="currentColor" />
                    <stop offset="50%" stopColor="#e7e5e4" />
                  </linearGradient>
                </defs>
                <path
                  fill={`url(#half-${i})`}
                  d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                />
              </>
            ) : (
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            )}
          </svg>
        ))}
      </div>
      {showCount && reviewCount !== undefined && (
        <span className="text-xs text-stone-500">
          ({reviewCount.toLocaleString()})
        </span>
      )}
    </div>
  );
};
