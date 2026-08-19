export interface IVectorItem {
  id: string;
  values: number[];
  metadata?: Record<string, any>;
}

export interface IVectorStore {
  upsert(items: IVectorItem[]): Promise<boolean>;
  query(vector: number[], topK?: number): Promise<IVectorItem[]>;
  delete(ids: string[]): Promise<boolean>;
}
