import express from 'express';
import { feishuPluginHandler } from './routes/feishu_plugin';

const app = express();
app.use(express.json());

app.post('/feishu_plugin', feishuPluginHandler);

app.listen(process.env.PORT || 3000, () => {
  console.log('Plugin server running...');
});
