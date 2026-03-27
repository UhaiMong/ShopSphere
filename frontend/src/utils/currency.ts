//  Currency
// All prices stored in cents on the backend
export const formatPrice = (cents: number, currency = "BDT"): string => {
  const amount = cents / 100;
  if (currency === "BDT") {
    return `৳${amount.toLocaleString("en-BD", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(
    amount,
  );
};

export const centsToDisplay = (cents: number): string => formatPrice(cents);
