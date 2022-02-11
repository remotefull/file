import { BaseFileRemote } from "./BaseFileRemote";
import { Client as FtpClient, AccessOptions, FileInfo } from "basic-ftp";
import { statSync } from "fs";
import path from "path/posix";
import { Writable } from "stream";
import { Stat } from "../types";

export class FtpFileRemote extends BaseFileRemote<FtpClient, FileInfo> {
  constructor(private options: AccessOptions, pathPrefix: string = "") {
    super(new FtpClient(), pathPrefix);
  }

  public async connect(): Promise<FtpFileRemote> {
    await this.client.access(this.options);
    return this;
  }

  public async disconnect(): Promise<void> {
    await this.client.close();
  }

  public async uploadDir(localPath: string, remotePath: string): Promise<void> {
    if (statSync(localPath).isFile()) {
      await this.uploadFile(localPath, remotePath);
      return;
    }

    remotePath = this.createPath(remotePath);

    await this.client.ensureDir(path.parse(remotePath).dir);
    await this.client.uploadFromDir(localPath, remotePath);
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
    const stat = await this.stat(base);

    if (stat && !stat.isDir) {
      throw new Error("parent is not a directory");
    }

    if (!stat) {
      await this.createDir(base, true);
    }

    await this.client.uploadFrom(localPath, remotePath);
  }

  public async deleteDir(remotePath: string): Promise<void> {
    return await this.delete(remotePath, true);
  }

  public async delete(remotePath: string, dir = false): Promise<void> {
    try {
      await (dir
        ? this.client.removeDir(this.createPath(remotePath))
        : this.client.remove(this.createPath(remotePath)));
    } catch (e) {
      const message =
        e && typeof e === "object" && e.hasOwnProperty("message")
          ? (e as any).message
          : e;

      console.log("failed to delete file/dir:", message);
    }
  }

  public async createFile(remotePath: string, content: string): Promise<void> {
    // Fake stream that the content is written into.
    const stream = new Writable();
    stream.write(content);
    stream.end();

    await this.client.uploadFrom(content, this.createPath(remotePath));
  }

  public async createDir(remotePath: string, recursive = true): Promise<void> {
    await this.client.ensureDir(this.createPath(remotePath));
  }

  async exists(remotePath: string): Promise<boolean> {
    return !!(await this.stat(this.createPath(remotePath)));
  }

  async stat(remotePath: string): Promise<Stat<FileInfo> | null> {
    remotePath = this.createPath(remotePath);
    const parsed = path.parse(remotePath);

    const stat = (await this.client.list(parsed.dir)).find(
      (f) => f.name === parsed.base
    );

    if (!stat) return null;

    return {
      name: stat.name,
      isDir: stat.isDirectory,
      isFile: stat.isFile,
      rawStat: stat,
    };
  }
}
