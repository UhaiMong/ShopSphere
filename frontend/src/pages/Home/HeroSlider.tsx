import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/services/app";
import { HeroSlide } from "@/types/typeHeroSlider";
import { Spinner } from "@/components/ui/Spinner";
import toast from "react-hot-toast";

export const HeroSlider: React.FC = () => {
  const [[page, direction], setPage] = useState([0, 0]);
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  //   const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | unknown>(null);
  const AUTO_PLAY_INTERVAL = 5000;
  const dragThreshold = 50;
  const currentIndex = Math.abs(page % slides.length);
  const nextSlide = useCallback(() => {
    setPage([page + 1, 1]); // 1 indicates forward
  }, [page, slides.length]);
  const prevSlide = useCallback(() => {
    setPage([page - 1, -1]);
  }, [page, slides.length]);

  useEffect(() => {
    try {
      void api.get<{ data: HeroSlide[] }>(`/hero`).then(({ data }) => {
        setSlides(data.data);
        setLoading(false);
      });
    } catch (error) {
      setLoading(false);
      setError(error);
      toast.error("Failed to load slider");
    }
  }, []);

  useEffect(() => {
    if (slides.length <= 1) return;

    const timer = setInterval(() => {
      nextSlide();
    }, AUTO_PLAY_INTERVAL);

    return () => clearInterval(timer);
  }, [nextSlide, slides.length]);

  if (!slides.length) {
    return <Spinner />;
  }

  /**
   * Drag Handler for Manual Interaction
   */
  const onDragEnd = (info: any) => {
    const offset = info.offset.x;
    if (offset < -dragThreshold) {
      nextSlide();
    } else if (offset > dragThreshold) {
      prevSlide();
    }
  };

  const currentSlide = slides[currentIndex];
  //   custom varient
  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  };
  if (error || slides.length === 0) return null;

  if (loading)
    return (
      <div className="h-[70vh] w-4xl mx-auto bg-brand-50 animate-pulse flex items-center justify-center">
        <Spinner />
      </div>
    );

  return (
    <section className="relative h-[80vh] w-full overflow-hidden bg-brand-900">
      <AnimatePresence initial={false} mode="popLayout">
        <motion.div
          key={page} // Using page instead of currentIndex ensures unique keys for every slide move
          custom={direction} // THIS IS CRITICAL: it tells the variants which direction to move
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.5 },
          }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          onDragEnd={onDragEnd}
          className="absolute inset-0 cursor-grab active:cursor-grabbing"
        >
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 scale-105"
            style={{ backgroundImage: `url(${currentSlide.backgroundImage})` }}
          >
            <div className="absolute inset-0 bg-linear-to-r from-brand-900/80 to-transparent" />
          </div>

          <div className="relative h-full max-w-7xl mx-auto px-6 flex flex-col justify-center items-start text-white">
            {currentSlide.offer && (
              <motion.span
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-brand-500 text-white px-4 py-1 rounded-full text-sm font-bold mb-4"
              >
                {currentSlide.offer}
              </motion.span>
            )}

            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight max-w-3xl"
            >
              {currentSlide.title}
            </motion.h1>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-6 text-lg md:text-xl text-brand-100 max-w-xl"
            >
              {currentSlide.subtitle}
            </motion.p>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-10"
            >
              <a
                href={currentSlide.ctaLink}
                className="bg-brand-500 hover:bg-brand-600 text-white font-bold py-4 px-8 rounded-lg transition-colors duration-300 inline-block shadow-lg hover:shadow-brand-500/50"
              >
                {currentSlide.ctaText}
              </a>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>
      <div className="absolute bottom-8 right-8 text-brand-200/50 text-xs uppercase tracking-widest hidden md:block">
        Swipe or Drag to explore
      </div>
    </section>
  );
};
