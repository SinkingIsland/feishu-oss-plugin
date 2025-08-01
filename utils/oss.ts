import OSS from 'ali-oss';

export interface OSSConfig {
  region: string;
  accessKeyId: string;
  accessKeySecret: string;
  bucket: string;
}

export function getOssClient(config: OSSConfig) {
  return new OSS({
    region: config.region,
    accessKeyId: config.accessKeyId,
    accessKeySecret: config.accessKeySecret,
    bucket: config.bucket
  });
}

export async function uploadFileToOSS(localPath: string, remotePath: string, config: OSSConfig): Promise<string> {
  const client = getOssClient(config);
  const result = await client.put(remotePath, localPath);
  return result.url;
}
