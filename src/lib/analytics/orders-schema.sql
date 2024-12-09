CREATE TABLE IF NOT EXISTS `link_generator.order_conversions`
(
  orderId STRING,
  orderNumber STRING,
  createdAt TIMESTAMP,
  cartId STRING,
  linkId STRING,
  customerId STRING,
  customerEmail STRING,
  totalAmount INT64,
  currency STRING,
  country STRING,
  timeToConversion INT64,  -- in seconds
  discountCode STRING,
  discountAmount INT64,
  products ARRAY<STRUCT<
    id STRING,
    quantity INT64,
    price INT64,
    originalPrice INT64,  -- price from original cart
    name STRING
  >>,
  originalCartTotal INT64,  -- total from the original cart
  orderTotal INT64         -- final order total
);