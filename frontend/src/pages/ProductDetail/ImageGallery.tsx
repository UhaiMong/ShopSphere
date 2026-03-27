import { cn } from "@/utils/cn";
import { useState } from "react";

// Image Gallery
export const ImageGallery = ({
  images,
  name,
}: {
  images: string[];
  name: string;
}) => {
  const [active, setActive] = useState(0);

  return (
    <div className="flex flex-col gap-3">
      {/* Main image */}
      <div className="aspect-square rounded-2xl overflow-hidden bg-stone-50 border border-stone-100">
        <img
          src={images[active]}
          alt={name}
          className="w-full h-full object-cover"
        />
      </div>
      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={cn(
                "w-16 h-16 shrink-0 rounded-xl overflow-hidden border-2 transition-all",
                i === active
                  ? "border-brand-500"
                  : "border-stone-100 hover:border-stone-200",
              )}
            >
              <img src={img} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
