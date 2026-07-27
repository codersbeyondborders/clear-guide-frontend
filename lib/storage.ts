import { apiClient } from './apiClient';

/**
 * Uploads a file directly to Google Cloud Storage using a Signed URL.
 * @param file The File object to upload
 * @param path The destination path in the GCS bucket (e.g., 'manuals/123/file.pdf')
 * @returns The public URL of the uploaded file
 */
export async function uploadToGCS(file: File, path: string): Promise<string> {
  // 1. Request a Signed URL from the Fastify API Gateway
  const { data } = await apiClient.post('/upload/signed-url', {
    fileName: path,
    contentType: file.type,
  });

  const { signedUrl, publicUrl } = data;

  // 2. Upload the file directly to GCS using the Signed URL
  const uploadResponse = await fetch(signedUrl, {
    method: 'PUT',
    body: file,
    headers: {
      'Content-Type': file.type,
    },
  });

  if (!uploadResponse.ok) {
    throw new Error('Failed to upload file to Google Cloud Storage.');
  }

  return publicUrl;
}
