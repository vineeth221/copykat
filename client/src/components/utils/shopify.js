const SHOPIFY_STORE_URL = "0pz2wr-nk.myshopify.com";
const SHOPIFY_ACCESS_TOKEN = "5c45c69d9f5cf8c302d014a4074d8393";

// ✅ Create a Shopify cart (if not already created)
export const createCart = async () => {
  try {
    const response = await fetch(`https://${SHOPIFY_STORE_URL}/api/2024-04/graphql.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": SHOPIFY_ACCESS_TOKEN,
      },
      body: JSON.stringify({
        query: `mutation createCart {
          cartCreate {
            cart {
              id
              checkoutUrl
            }
          }
        }`,
      }),
    });

    const jsonResponse = await response.json();

    const cartId = jsonResponse?.data?.cartCreate?.cart?.id;
    if (cartId) {
      localStorage.setItem("shopifyCartId", cartId);
    }

    return cartId;
  } catch (error) {
  }
};


// ✅ Fetch an existing cart or create a new one
export const fetchCart = async () => {
  const cartId = localStorage.getItem("shopifyCartId");
  if (!cartId) return createCart(); // Create cart if none exists

  try {
    const response = await fetch(`https://${SHOPIFY_STORE_URL}/api/2024-04/graphql.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": SHOPIFY_ACCESS_TOKEN,
      },
      body: JSON.stringify({
        query: `query getCart($cartId: ID!) {
          cart(id: $cartId) {
            id
            checkoutUrl
            lines(first: 10) {
              edges {
                node {
                  id
                  quantity
                  merchandise {
                    ... on ProductVariant {
                      id
                      title
                      priceV2 {
                        amount
                        currencyCode
                      }
                      image {
                        src
                      }
                      product {
                        title
                        description
                      }
                    }
                  }
                }
              }
            }
          }
        }`,
        variables: { cartId },
      }),
    });

    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

    const jsonResponse = await response.json();
    return jsonResponse.data.cart;
  } catch (error) {
    return createCart(); // Create a new cart if fetch fails
  }
};


// ✅ Add an item to the cart
export const addToCart = async (variantId, quantity = 1) => {
  const cart = await fetchCart();

  try {
    const response = await fetch(`https://${SHOPIFY_STORE_URL}/api/2024-04/graphql.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": SHOPIFY_ACCESS_TOKEN,
      },
      body: JSON.stringify({
        query: `mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
          cartLinesAdd(cartId: $cartId, lines: $lines) {
            cart {
              id
              checkoutUrl
              lines(first: 10) {
                edges {
                  node {
                    id
                    quantity
                    merchandise {
                      ... on ProductVariant {
                        id
                        title
                        priceV2 {
                          amount
                          currencyCode
                        }
                        image {
                          src
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }`,
        variables: {
          cartId: cart.id,
          lines: [{ merchandiseId: variantId, quantity }],
        },
      }),
    });

    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

    const jsonResponse = await response.json();

    return jsonResponse.data.cartLinesAdd.cart;
  } catch (error) {
    return null;
  }
};


// ✅ Update item quantity
export const updateCartQuantity = async (lineItemId, quantity) => {
  const cart = await fetchCart();

  try {
    const response = await fetch(`https://${SHOPIFY_STORE_URL}/api/2024-04/graphql.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": SHOPIFY_ACCESS_TOKEN,
      },
      body: JSON.stringify({
        query: `mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
          cartLinesUpdate(cartId: $cartId, lines: $lines) {
            cart {
              id
              checkoutUrl
              lines(first: 10) {
                edges {
                  node {
                    id
                    quantity
                    merchandise {
                      ... on ProductVariant {
                        id
                        title
                        priceV2 {
                          amount
                          currencyCode
                        }
                        image {
                          src
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }`,
        variables: {
          cartId: cart.id,
          lines: [{ id: lineItemId, quantity }],
        },
      }),
    });

    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

    const jsonResponse = await response.json();
    return jsonResponse.data.cartLinesUpdate.cart;
  } catch (error) {
    return null;
  }
};

// ✅ Remove an item from the cart
export const removeFromCart = async (lineItemId) => {
  const cart = await fetchCart();

  try {
    const response = await fetch(`https://${SHOPIFY_STORE_URL}/api/2024-04/graphql.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": SHOPIFY_ACCESS_TOKEN,
      },
      body: JSON.stringify({
        query: `mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
          cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
            cart {
              id
              checkoutUrl
              lines(first: 10) {
                edges {
                  node {
                    id
                    quantity
                    merchandise {
                      ... on ProductVariant {
                        id
                        title
                        priceV2 {
                          amount
                          currencyCode
                        }
                        image {
                          src
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }`,
        variables: {
          cartId: cart.id,
          lineIds: [lineItemId],
        },
      }),
    });

    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

    const jsonResponse = await response.json();
    return jsonResponse.data.cartLinesRemove.cart;
  } catch (error) {
    return null;
  }
};

// ✅ Get Shopify Checkout URL
export const getCheckoutUrl = async () => {
  const cart = await fetchCart();
  return cart.checkoutUrl;
};