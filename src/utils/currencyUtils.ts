
/**
 * Format a price in Tunisian Dinar
 * @param price The price to format
 * @param showCurrency Whether to include the currency symbol
 * @returns Formatted price string
 */
export const formatPrice = (price: number, showCurrency = true): string => {
  const formattedPrice = price.toFixed(2);
  return showCurrency ? `${formattedPrice} DT` : formattedPrice;
};
