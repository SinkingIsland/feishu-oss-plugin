import fs from 'fs';
import path from 'path';
import axios from 'axios';

export async function downloadToTemp(url: string, filename: string): Promise<string> {
  const filePath = path.resolve(__dirname, '..', 'temp', filename);
  const writer = fs.createWriteStream(filePath);
  const response = await axios.get(url, { responseType: 'stream' });
  response.data.pipe(writer);
  return new Promise((resolve, reject) => {
    writer.on('finish', () => resolve(filePath));
    writer.on('error', reject);
  });
}
