
/**
 * Format a price in Tunisian Dinar
 * @param price The price to format
 * @param showCurrency Whether to include the currency symbol
 * @returns Formatted price string
 */
export const formatPrice = (price: number, showCurrency = true): string => {
  if (isNaN(price) || price === null || price === undefined) {
    return showCurrency ? '0.00 DT' : '0.00';
  }
  
  // Format number to 2 decimal places
  const formattedPrice = Number(price).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
  
  // Return with or without currency symbol
  return showCurrency ? `${formattedPrice} DT` : formattedPrice;
};

/**
 * Parse price string to number
 * @param priceString The price string to parse
 * @returns Parsed price as number
 */
export const parsePrice = (priceString: string): number => {
  if (!priceString) return 0;
  // Remove currency symbol and commas, then parse as float
  return parseFloat(priceString.replace(/[^\d.-]/g, ''));
};
