// src/lib/utils/gcs.ts
import { Storage } from '@google-cloud/storage';

const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT,
  credentials: {
    client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_CLOUD_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
});

const bucketName = process.env.GOOGLE_CLOUD_BUCKET_NAME!;
const bucket = storage.bucket(bucketName);

export async function uploadToGCS(buffer: Buffer, key: string): Promise<string> {
  try {
    console.log('Starting upload to GCS...'); // Debug log
    const filename = `qr-codes/${key}.png`;
    const file = bucket.file(filename);
    
    // Upload the file without ACL
    await file.save(buffer, {
      metadata: {
        contentType: 'image/png',
      },
    });

    // Generate a public URL - with uniform bucket-level access
    const publicUrl = `https://storage.googleapis.com/${bucketName}/${filename}`;
    console.log('File uploaded successfully:', publicUrl);
    
    return publicUrl;
  } catch (error) {
    console.error('Detailed upload error:', error);
    throw error;
  }
}