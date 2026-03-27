// Product
export const getDiscountPercent = (
  price: number,
  comparePrice?: number,
): number => {
  if (!comparePrice || comparePrice <= price) return 0;
  return Math.round(((comparePrice - price) / comparePrice) * 100);
};

export const getStarArray = (rating: number): (1 | 0.5 | 0)[] =>
  [1, 2, 3, 4, 5].map((i) => {
    if (rating >= i) return 1;
    if (rating >= i - 0.5) return 0.5;
    return 0;
  });
