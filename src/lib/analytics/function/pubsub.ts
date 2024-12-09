// src/lib/analytics/pubsub.ts
import { PubSub } from '@google-cloud/pubsub';
import { LinkCreatedEvent } from '../schema';

const pubsub = new PubSub({
  projectId: process.env.GOOGLE_CLOUD_PROJECT,
  credentials: {
    client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_CLOUD_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
});

const TOPIC_NAME = 'link-created-events';

export async function publishLinkCreatedEvent(data: LinkCreatedEvent) {
  try {
    const topic = pubsub.topic(TOPIC_NAME);
    const messageBuffer = Buffer.from(JSON.stringify(data));
    
    const messageId = await topic.publish(messageBuffer);
    console.log(`Message ${messageId} published.`);
    
    return messageId;
  } catch (error) {
    console.error('Error publishing message:', error);
    throw error;
  }
}