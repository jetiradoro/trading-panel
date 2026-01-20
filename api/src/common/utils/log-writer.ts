import * as fs from 'fs/promises';
import * as path from 'path';
import * as dayjs from 'dayjs';

const sanitize = (value: string) => value.replace(/\s+/g, ' ').trim();

/**
 * Escribe logs en archivos dentro de api/logs.
 */
export async function appendLog(fileName: string, message: string) {
  const logsDir = path.resolve(__dirname, '../../../logs');
  await fs.mkdir(logsDir, { recursive: true });

  const timestamp = dayjs().format('YYYY-MM-DD HH:mm:ss');
  const line = `[${timestamp}] ${sanitize(message)}`;
  const filePath = path.join(logsDir, fileName);
  await fs.appendFile(filePath, `${line}\n`, 'utf8');
}
