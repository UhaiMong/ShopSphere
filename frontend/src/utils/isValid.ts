// Validation
export const isValidEmail = (email: string): boolean =>
  /^\S+@\S+\.\S+$/.test(email);

export const isValidPhone = (phone: string): boolean =>
  /^\+?[\d\s\-()]{7,15}$/.test(phone);
