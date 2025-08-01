import { Request, Response } from 'express';
import { BaseClient } from '@lark-base-open/node-sdk';
import { OSSConfig, uploadFileToOSS } from '../utils/oss';
import { downloadToTemp } from '../utils/download';
import fs from 'fs';

const client = new BaseClient({
  appToken: process.env.APP_TOKEN!,
  personalBaseToken: process.env.PERSONAL_TOKEN!
});

// 判断 file 是否是一个具有 url 和 name 字段的合法对象
function isValidFile(file: any): file is { url: string; name: string } {
  return (
    typeof file === 'object' &&
    file !== null &&
    'url' in file &&
    'name' in file &&
    typeof file.url === 'string' &&
    typeof file.name === 'string'
  );
}

export async function feishuPluginHandler(req: Request, res: Response) {
  const {
    table_id,
    attachment_field_id,
    output_field_id,
    oss_config
  }: {
    table_id: string;
    attachment_field_id: string;
    output_field_id: string;
    oss_config: OSSConfig;
  } = req.body;

  try {
    const recordIter = await client.base.appTableRecord.listWithIterator({
      path: { table_id },
      params: { page_size: 50 }
    });

    for await (const batch of recordIter) {
      if (!batch || !batch.items) continue;

      const updates: any[] = [];

      for (const record of batch.items) {
        const recordId = record.record_id;
        const attachments = record.fields[attachment_field_id];

        if (!Array.isArray(attachments)) continue;

        for (const file of attachments) {
          if (isValidFile(file)) {
            const localPath = await downloadToTemp(file.url, file.name);
            const ossUrl = await uploadFileToOSS(localPath, `videos/${file.name}`, oss_config);
            fs.unlinkSync(localPath); // 删除临时文件

            updates.push({
              record_id: recordId,
              fields: {
                [output_field_id]: ossUrl
              }
            });
          }
        }
      }

      if (updates.length > 0) {
        await client.base.appTableRecord.batchUpdate({
          path: { table_id },
          data: { records: updates }
        });
      }
    }

    res.json({ msg: '上传完成' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: '出错', error });
  }
}
