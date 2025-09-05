import type { Insight } from "./Insight";

export interface Page {
  id: string;
  docHash: string;
  pageNumber: number;
  createdAt: string;
  updatedAt: string;
}

export interface Text {
  id: string;
  docHash: string;
  pageId: string;
  pageNumber: number;
  content: string;
  createdAt: string;
  updatedAt: string;
} 

export interface Document {
  docHash: string;
  createdAt: string;
  updatedAt: string;
  s3Bucket: string;
  s3Key: string;
  pages?: {
    items: Page[];
  };
  texts?: {
    items: Text[];
  };
  insights?: {
    items: Insight[];
  };
}
