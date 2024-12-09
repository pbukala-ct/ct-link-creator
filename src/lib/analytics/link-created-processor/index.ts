import { BigQuery } from '@google-cloud/bigquery';

const bigquery = new BigQuery();
const DATASET = 'link_generator';
const TABLE = 'link_created_events';

exports.processLinkCreatedEvent = async (pubsubMessage: any, context: any) => {
  try {
    const data = JSON.parse(Buffer.from(pubsubMessage.data, 'base64').toString());
    
    // Insert data into BigQuery
    await bigquery
      .dataset(DATASET)
      .table(TABLE)
      .insert([data]);

    console.log(`Successfully inserted event for link ${data.linkId}`);
  } catch (error) {
    console.error('Error processing event:', error);
    throw error;
  }
};