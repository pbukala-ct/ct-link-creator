const {BigQuery} = require('@google-cloud/bigquery');

const bigquery = new BigQuery();
const DATASET = 'link_generator';
const TABLE = 'link_created_events';

exports.processLinkCreatedEvent = async (pubsubMessage, context) => {
  try {
    // Parse the Pub/Sub message
    const data = JSON.parse(Buffer.from(pubsubMessage.data, 'base64').toString());
    
    // Format the data for BigQuery
    const row = {
      linkId: data.linkId,
      cartId: data.cartId,
      createdAt: data.createdAt,
      customerId: data.customerId || null,
      currency: data.currency,
      country: data.country,
      totalAmount: data.totalAmount,
      products: data.products,
      discountCode: data.discountCode || null,
      directDiscount: data.directDiscount || null
    };

    // Insert into BigQuery
    await bigquery
      .dataset(DATASET)
      .table(TABLE)
      .insert([row]);

    console.log(`Successfully processed event for link ${data.linkId}`);
  } catch (error) {
    console.error('Error processing event:', error);
    throw error;
  }
};