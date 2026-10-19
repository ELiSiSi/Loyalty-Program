import QRCode from 'qrcode';

export class QrCodeService {
  /**
   * Generates a base64 DataURL (PNG) representation of a QR code
   */
  static async generateDataUrl(payload: string | object): Promise<string> {
    const text = typeof payload === 'string' ? payload : JSON.stringify(payload);
    return await QRCode.toDataURL(text, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 300,
      color: {
        dark: '#1e293b',
        light: '#ffffff',
      },
    });
  }

  /**
   * Generates clean scalable SVG string of the QR code
   */
  static async generateSvg(payload: string | object): Promise<string> {
    const text = typeof payload === 'string' ? payload : JSON.stringify(payload);
    return await QRCode.toString(text, {
      type: 'svg',
      errorCorrectionLevel: 'H',
      margin: 1,
    });
  }
}
