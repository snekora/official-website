/**
 * Generates a formatted WhatsApp order message and opens WhatsApp in a new tab.
 *
 * @param {Object} params
 * @param {Object} params.product - The product object (name, price, slug, etc.)
 * @param {Object} params.selectedVariant - The currently selected variant (color, sizes, etc.)
 * @param {string|number} params.selectedSize - The selected size
 * @param {number} params.quantity - The quantity to order
 * @param {Object} params.address - The user's default address
 * @returns {string} The generated WhatsApp URL
 */

/**
 * Builds the WhatsApp order message string.
 */
export const buildWhatsAppMessage = ({ product, selectedVariant, selectedSize, quantity = 1, address }) => {
  const productUrl = `${window.location.origin}/product/${product.slug || product._id}`;
  const qty = Math.max(1, Math.floor(quantity));
  const totalPrice = product.price * qty;

  const colorLine = selectedVariant?.color?.name ? `Color: ${selectedVariant.color.name}` : "";
  const sizeLine = selectedSize ? `Size: UK ${selectedSize}` : "";
  const variantDetails = [colorLine, sizeLine].filter(Boolean).join("\n");

  const formatPrice = (val) => val.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const message = `🛒 *New Order*

*Customer*
Name: ${address.name}
Phone: ${address.phone}${address.alternativePhone ? `\nAlt Phone: ${address.alternativePhone}` : ""}

*Delivery Address*
${address.line1}${address.line2 ? `\n${address.line2}` : ""}
${address.city}
${address.state} - ${address.pincode}

*Product*
${product.name}${variantDetails ? `\n${variantDetails}` : ""}

*Price*
₹${formatPrice(product.price)} x ${qty} = ₹${formatPrice(totalPrice)}

*Quantity*
${qty}

*Product Link*
${productUrl}`;

  return message;
};

/**
 * Opens WhatsApp with the pre-filled order message.
 */
export const openWhatsApp = ({ product, selectedVariant, selectedSize, quantity, address }) => {
  const businessNumber = import.meta.env.VITE_WHATSAPP_BUSINESS_NUMBER;

  if (!businessNumber) {
    console.error("VITE_WHATSAPP_BUSINESS_NUMBER is not set in .env");
    return null;
  }

  const message = buildWhatsAppMessage({ product, selectedVariant, selectedSize, quantity, address });
  const url = `https://wa.me/${businessNumber}?text=${encodeURIComponent(message)}`;

  const isMobile =
    typeof navigator !== "undefined" &&
    /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  if (isMobile) {
    window.location.href = url;
  } else {
    const newWindow = window.open(url, "_blank", "noopener,noreferrer");
    if (!newWindow || newWindow.closed || typeof newWindow.closed === "undefined") {
      window.location.href = url;
    }
  }
  return url;
};

/**
 * Builds the WhatsApp order message string for an entire cart.
 */
export const buildCartWhatsAppMessage = ({ cartItems, address, subtotal, shipping, total }) => {
  const formatPrice = (val) => val.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  let message = `🛒 *New Order (Cart Checkout)*

*Customer*
Name: ${address.name}
Phone: ${address.phone}${address.alternativePhone ? `\nAlt Phone: ${address.alternativePhone}` : ""}

*Delivery Address*
${address.line1}${address.line2 ? `\n${address.line2}` : ""}
${address.city}
${address.state} - ${address.pincode}

*Order Items*
`;

  cartItems.forEach((item, index) => {
    const product = item.product;
    const variant = product.variants?.find(v => v._id === item.variant) || {};
    const colorName = variant.color?.name ? `Color: ${variant.color.name}` : "";
    const sizeName = item.size ? `Size: UK ${item.size}` : "";
    const variantDetails = [colorName, sizeName].filter(Boolean).join(", ");
    
    const itemTotal = product.price * item.quantity;
    const productUrl = `${window.location.origin}/product/${product.slug || product._id}`;

    message += `
${index + 1}. ${product.name}
${variantDetails}
Price: ₹${formatPrice(product.price)} x ${item.quantity} = ₹${formatPrice(itemTotal)}
Link: ${productUrl}
`;
  });

  message += `
*Order Summary*
Subtotal: ₹${formatPrice(subtotal)}
Shipping: ${shipping === 0 ? "FREE" : `₹${formatPrice(shipping)}`}
*Total: ₹${formatPrice(total)}*
`;

  return message;
};

/**
 * Opens WhatsApp with the pre-filled order message for a cart.
 */
export const openCartWhatsApp = ({ cartItems, address, subtotal, shipping, total }) => {
  const businessNumber = import.meta.env.VITE_WHATSAPP_BUSINESS_NUMBER;

  if (!businessNumber) {
    console.error("VITE_WHATSAPP_BUSINESS_NUMBER is not set in .env");
    return null;
  }

  const message = buildCartWhatsAppMessage({ cartItems, address, subtotal, shipping, total });
  const url = `https://wa.me/${businessNumber}?text=${encodeURIComponent(message)}`;

  const isMobile =
    typeof navigator !== "undefined" &&
    /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  if (isMobile) {
    window.location.href = url;
  } else {
    const newWindow = window.open(url, "_blank", "noopener,noreferrer");
    if (!newWindow || newWindow.closed || typeof newWindow.closed === "undefined") {
      window.location.href = url;
    }
  }
  return url;
};
