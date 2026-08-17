export interface PageMetadataOptions {
  title: string;
  description: string;
  pathname?: string;
  image?: string;
}

export interface JsonLdData {
  '@context': string;
  '@type'?: string;
  [key: string]: unknown;
}
