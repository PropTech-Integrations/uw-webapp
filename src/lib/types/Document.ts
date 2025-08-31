export interface Page {
  id: string;
  docHash: string;
  pageNumber: number;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentAndPages {
  docHash: string;
  createdAt: string;
  updatedAt: string;
  s3Bucket: string;
  s3Key: string;
  pages: {
    items: Page[];
  };
}
