// order-conversion-processor/index.js
const {BigQuery} = require('@google-cloud/bigquery');
const { apiRoot } = require('./commercetools');

const bigquery = new BigQuery();
const DATASET = 'link_generator';
const TABLE = 'order_conversions';

exports.processOrderCreated = async (pubsubMessage, context) => {
  try {
    // Parse the Pub/Sub message
    const messageData = JSON.parse(Buffer.from(pubsubMessage.data, 'base64').toString());
    const orderId = messageData.resource.id;

    // Get order details from commercetools
    const orderResponse = await apiRoot
    .orders()
    .withId({ID: orderId})
    .get()
    .execute();

  if(!orderResponse) {
    console.log('Unable to fetch order',message.resource.id);
    return;
  }
    
    const order = orderResponse.body;
    console.log('order',JSON.stringify(orderResponse,null,2));

    // Only process orders that came from our link generator
    if (!order?.custom?.fields?.linkId) {
      console.log(`Order ${orderId} not from link generator, skipping`);
      return;
    }else{
        console.log(`Order ${orderId} is coming from link generator!`);
    }

    // Calculate time to conversion
    const cartCreatedAt = new Date(order.custom.fields.createdAt);
    const orderCreatedAt = new Date(order.createdAt);
    const timeToConversion = Math.floor((orderCreatedAt.getTime() - cartCreatedAt.getTime()) / 1000);

    // Format data for BigQuery
    const row = {
      orderId: order.id,
      orderNumber: order.orderNumber,
      createdAt: order.createdAt,
      cartId: order.cart.id,
      linkId: order.custom.fields.linkId,
      customerId: order.customerId,
      customerEmail: order.customerEmail,
      totalAmount: order.totalPrice.centAmount,
      currency: order.totalPrice.currencyCode,
      country: order.country,
      timeToConversion,
      discountCode: order.discountCodes?.[0]?.discountCode?.obj?.code,
      discountAmount: calculateTotalDiscount(order),
      products: order.lineItems.map(item => ({
        id: item.productId,
        quantity: item.quantity,
        price: item.price.value.centAmount,
        originalPrice: item.price.value.centAmount,
        name: item.name[Object.keys(item.name)[0]]  // take first available locale
      })),
      //originalCartTotal: cart.totalPrice.centAmount,
      orderTotal: order.totalPrice.centAmount
    };

    // Insert into BigQuery
    await bigquery
      .dataset(DATASET)
      .table(TABLE)
      .insert([row]);

    console.log(`Successfully processed order conversion for order ${orderId}`);
  } catch (error) {
    console.error('Error processing order:', error);
    throw error;
  }
};

function calculateTotalDiscount(order) {
  let totalDiscount = 0;
  
  // Sum up line item discounts
  order.lineItems.forEach(item => {
    if (item.discountedPrice) {
      const originalAmount = item.price.value.centAmount * item.quantity;
      const discountedAmount = item.discountedPrice.value.centAmount * item.quantity;
      totalDiscount += (originalAmount - discountedAmount);
    }
  });

  // Add cart-level discounts
  if (order.discountOnTotalPrice) {
    totalDiscount += order.discountOnTotalPrice.discountedAmount.centAmount;
  }

  return totalDiscount;
}

// function findOriginalPrice(cart, orderItem) {
//   const cartItem = cart.lineItems.find(item => item.productId === orderItem.productId);
//   return cartItem ? cartItem.price.value.centAmount : null;
// }