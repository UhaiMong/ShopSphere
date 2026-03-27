// Text
export const truncate = (str: string, maxLength: number): string =>
  str.length <= maxLength ? str : `${str.slice(0, maxLength - 3)}...`;

export const capitalize = (str: string): string =>
  str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

export const slugToTitle = (slug: string): string =>
  slug.split("-").map(capitalize).join(" ");
