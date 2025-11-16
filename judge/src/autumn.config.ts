import {
  feature,
  product,
  featureItem,
  pricedFeatureItem,
  priceItem,
} from "atmn";

// Features
export const messages = feature({
  id: "messages",
  name: "Messages",
  type: "single_use",
});

// Products
export const free = product({
  id: "free",
  name: "Free",
  items: [
    // 5 messages per month
    featureItem({
      feature_id: messages.id,
      included_usage: 5,
      interval: "month",
    }),
  ],
});

export const pro = product({
  id: "pro",
  name: "Pro",
  items: [
    // 100 messages per month
    featureItem({
      feature_id: messages.id,
      included_usage: 100,
      interval: "month",
    }),
    // $20 per month
    priceItem({
      price: 20,
      interval: "month",
    }),
  ],
});