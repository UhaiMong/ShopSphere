import { StarRating } from "@/components/ui/StarRating";
import { Review } from "@/types/typeReview";
import { timeAgo } from "@/utils/dateTime";
import { Check } from "lucide-react";

//  Review Item
export const ReviewItem = ({ review }: { review: Review }) => (
  <div className="py-5 border-b border-stone-100 last:border-0">
    <div className="flex items-start gap-3">
      <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center shrink-0">
        {review.user.avatar ? (
          <img
            src={review.user.avatar}
            alt=""
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          <span className="text-sm font-semibold text-brand-600">
            {review.user.name.charAt(0)}
          </span>
        )}
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <span className="text-sm font-semibold text-stone-800">
              {review.user.name}
            </span>
            {review.isVerifiedPurchase && (
              <span className="ml-2 text-xs text-green-600 font-medium flex-inline items-center gap-0.5">
                <Check className="w-3 h-3 inline" /> Verified Purchase
              </span>
            )}
          </div>
          <span className="text-xs text-stone-400">
            {timeAgo(review.createdAt)}
          </span>
        </div>
        <StarRating rating={review.rating} showCount={false} size="sm" />
        {review.title && (
          <p className="font-medium text-stone-800 text-sm mt-1">
            {review.title}
          </p>
        )}
        <p className="text-sm text-stone-600 mt-1 leading-relaxed">
          {review.body}
        </p>
        {review.helpfulCount > 0 && (
          <p className="text-xs text-stone-400 mt-2">
            {review.helpfulCount} people found this helpful
          </p>
        )}
      </div>
    </div>
  </div>
);
