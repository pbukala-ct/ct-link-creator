CREATE SCHEMA IF NOT EXISTS `link_generator`;

-- Create table
CREATE TABLE IF NOT EXISTS `link_generator.link_created_events`
(
  linkId STRING,
  cartId STRING,
  createdAt TIMESTAMP,
  customerId STRING,
  currency STRING,
  country STRING,
  totalAmount INT64,
  products ARRAY<STRUCT<
    id STRING,
    quantity INT64,
    price INT64
  >>,
  discountCode STRING,
  directDiscount STRUCT<
    type STRING,
    value FLOAT64
  >
);