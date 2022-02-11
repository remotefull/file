import { BaseFileRemote } from "./BaseFileRemote";
import SftpClient, { ConnectOptions, FileStats } from "ssh2-sftp-client";
import { statSync } from "fs";
import path from "path/posix";
import { Stat } from "../types";

export class SftpFileRemote extends BaseFileRemote<SftpClient, FileStats> {
  constructor(private options: ConnectOptions, pathPrefix: string = "") {
    super(new SftpClient(), pathPrefix);
  }

  public async connect(): Promise<SftpFileRemote> {
    await this.client.connect(this.options);
    return this;
  }

  public async disconnect(): Promise<void> {
    await this.client.end();
  }

  public async uploadDir(localPath: string, remotePath: string): Promise<void> {
    if (statSync(localPath).isFile()) {
      await this.uploadFile(localPath, remotePath);
      return;
    }

    await this.client.uploadDir(localPath, this.createPath(remotePath));
  }

  public async uploadFile(
    localPath: string,
    remotePath: string
  ): Promise<void> {
    if (statSync(localPath).isDirectory()) {
      await this.uploadDir(localPath, remotePath);
      return;
    }

    remotePath = this.createPath(remotePath);

    // Ensure the parent folders exist.
    const base = path.join(remotePath, "..");
    const stat = await this.client.exists(base);

    if (stat && stat !== "d") {
      throw new Error("parent is not a directory");
    }

    if (!stat) {
      await this.createDir(base, true);
    }

    await this.client.fastPut(localPath, remotePath);
  }

  public async delete(remotePath: string, dir = false): Promise<void> {
    try {
      await (dir
        ? this.client.rmdir(this.createPath(remotePath), true)
        : this.client.delete(this.createPath(remotePath), false));
    } catch (e) {
      const message =
        e && typeof e === "object" && e.hasOwnProperty("message")
          ? (e as any).message
          : e;

      console.log("failed to delete file/dir:", message);
    }
  }

  public async createFile(remotePath: string, content: string): Promise<void> {
    await this.client.put(Buffer.from(content), this.createPath(remotePath));
  }

  public async createDir(remotePath: string, recursive = true): Promise<void> {
    await this.client.mkdir(this.createPath(remotePath), recursive);
  }

  async exists(remotePath: string): Promise<boolean> {
    return !!(await this.client.exists(this.createPath(remotePath)));
  }

  async stat(remotePath: string): Promise<Stat<FileStats> | null> {
    const stat = await this.client.stat(this.createPath(remotePath));

    return {
      name: path.parse(remotePath).name,
      isFile: stat.isFile,
      isDir: stat.isDirectory,
      rawStat: stat,
    };
  }
}
