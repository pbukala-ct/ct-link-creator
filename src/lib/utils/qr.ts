import QRCode from 'qrcode';

export async function generateQRCodeAsDataURL(url: string): Promise<string> {
  try {
    const qrDataUrl = await QRCode.toDataURL(url, {
      width: 256,
      margin: 1,
      errorCorrectionLevel: 'H'
    });
    return qrDataUrl;
  } catch (err) {
    console.error('Error generating QR code:', err);
    throw err;
  }
}

// Convert data URL to Buffer
export function dataURLtoBuffer(dataUrl: string): Buffer {
  const base64Data = dataUrl.split(',')[1];
  return Buffer.from(base64Data, 'base64');
}