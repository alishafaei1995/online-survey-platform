import QRCode from 'qrcode';

export async function generateQrDataUrl(text) {
  return QRCode.toDataURL(text, { margin: 1, width: 300 });
}
