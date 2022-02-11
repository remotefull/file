export interface Stat<TRawStat = any> {
  name: string;
  isDir: boolean;
  isFile: boolean;
  rawStat: TRawStat;
}
