import { createColors } from "picocolors";
import fs from "fs";
import path from "path";

const colors = createColors(true);

type LogLevel = "info" | "warn" | "error" | "debug" | "success";

const formatTime = () =>
  new Date().toISOString().replace("T", " ").split(".")[0];

const tagColors: Record<LogLevel, (text: string) => string> = {
  info: colors.cyan,
  warn: colors.yellow,
  error: colors.red,
  debug: colors.magenta,
  success: colors.green,
};

const log = (level: LogLevel, message: string, ...args: any[]) => {
  const color = tagColors[level];
  const tag = color(`[${level.toUpperCase()}]`);
  const time = colors.gray(`[${formatTime()}]`);
  console.log(`${time} ${tag} ${message}`, ...args);
};

export const logger = {
  info: (msg: string, ...args: any[]) => log("info", msg, ...args),
  warn: (msg: string, ...args: any[]) => log("warn", msg, ...args),
  error: (msg: string, ...args: any[]) => log("error", msg, ...args),
  debug: (msg: string, ...args: any[]) => log("debug", msg, ...args),
  success: (msg: string, ...args: any[]) => log("success", msg, ...args),
};

export interface FileInfo {
  fileName: string;
  filePath: string;
}
/**
 *
 * @param dir - The directory to locate for files
 * @param nested - To recursive search the directory
 *
 */
export const getFiles = (dir: string, nested?: boolean): FileInfo[] => {
  const filesInfo: FileInfo[] = [];
  const folders = fs.readdirSync(dir, { withFileTypes: true });
  folders.forEach((folder) => {
    const folderPath = path.join(dir, folder.name);
    const fileName = folder.name;
    if (folder.isDirectory() && nested) {
      filesInfo.push(...getFiles(folderPath, nested));
    } else if (folder.isFile()) {
      filesInfo.push({
        fileName,
        filePath: folderPath,
      });
    }
  });

  return filesInfo;
};
