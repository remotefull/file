import posixPath from "path/posix";
import { Stat } from "../types";

export abstract class BaseUploader<TClient = any, TRawStat = any> {
  protected constructor(
    protected client: TClient,
    private pathPrefix: string = ""
  ) {}

  /**
   * Sets the remote path prefix.
   * @param {string} prefix The new prefix.
   */
  public setPathPrefix(prefix: string): void {
    this.pathPrefix = prefix;
  }

  /**
   * Constructs a path with the path prefix.
   *
   * @param {string} path Path to be prefixed.
   */
  public createPath(path: string): string {
    return posixPath.join(this.pathPrefix, path);
  }

  private _fni(): any {
    throw new Error("Function not implemented");
  }

  /**
   * Uploads a local file to a remote path.
   *
   * @param {string} localPath The file to be uploaded.
   * @param {string} remotePath The remote file path.
   */
  async uploadFile(localPath: string, remotePath: string): Promise<void> {
    this._fni();
  }

  /**
   * Uploads a local directory to a remote path.
   *
   * @param {string} localPath The file to be uploaded.
   * @param {string} remotePath The remote directory path.
   */
  async uploadDir(localPath: string, remotePath: string): Promise<void> {
    this._fni();
  }

  /**
   * Creates a file with specified content.
   *
   * @param {string} remotePath Remote destination to a file.
   * @param {string} content Content of the new file.
   */
  async createFile(remotePath: string, content: string): Promise<void> {
    this._fni();
  }

  /**
   * Creates a directory.
   *
   * @param {string} remotePath Path to the directory.
   */
  async createDir(remotePath: string): Promise<void> {
    this._fni();
  }

  /**
   * Checks whether a remote path exists.
   *
   * @param {string} remotePath Path to be checked.
   */
  async exists(remotePath: string): Promise<boolean> {
    return this._fni();
  }

  /**
   * Stats for a path
   * @param {string} remotePath Path to stat
   */
  async stat(remotePath: string): Promise<Stat<TRawStat> | null> {
    return this._fni();
  }

  /**
   * Establishes a new connection. Has to be called before other
   * function calls that use the remote.
   */
  async connect(): Promise<BaseUploader> {
    return this._fni();
  }

  /**
   * Deletes a remote directory. Shorthand for delete(remotePath, true).
   * @param {string} remotePath Path to the directory.
   */
  async deleteDir(remotePath: string): Promise<void> {
    await this.delete(remotePath, true);
  }

  /**
   * Deletes a remote path.
   *
   * @param {string} remotePath Path to the file or directory.
   * @param {boolean} dir Is the remote path a directory?
   */
  async delete(remotePath: string, dir?: boolean): Promise<void> {
    this._fni();
  }

  /**
   * Disconnects from the remote. No calls can be made unless .connect()
   * is called again.
   */
  async disconnect(): Promise<void> {
    this._fni();
  }

  /**
   * Gets the underlying client the uploader is wrapping.
   * @private
   */
  private getClient(): TClient {
    return this.client;
  }
}
