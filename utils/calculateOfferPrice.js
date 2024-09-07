export const calculateOfferPrice = (
  salePrice,
  productOffer,
  categoryOffer,
  offerExpirationDate
) => {
  const isOfferValid =
    !offerExpirationDate || new Date(offerExpirationDate) >= new Date();

  const bestOffer = isOfferValid ? Math.max(productOffer, categoryOffer) : 0;

  if (bestOffer === 0) {
    return {
      discountedPrice: null,
      originalPrice: salePrice.toFixed(2),
      offerPercentage: 0,
    };
  }

  const discountAmount = (salePrice * bestOffer) / 100;
  const discountedPrice = salePrice - discountAmount;

  return {
    discountedPrice: Math.round(discountedPrice),
    originalPrice: Math.round(salePrice),
    offerPercentage: bestOffer,
  };
};
