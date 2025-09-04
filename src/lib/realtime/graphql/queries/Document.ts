export const Q_DOCUMENT_AND_PAGES_BY_ID = `
  query documentById {
    document(
      docHash: "27ac91e378b055931a20843d545dabfc6b5c75f7b2953147ccc5fb66fc9848f5"
    ) {
      createdAt
      docHash
      pages {
        items {
          createdAt
          docHash
          id
          pageNumber
          updatedAt
        }
        nextToken
      }
      s3Bucket
      s3Key
      updatedAt
    }
  }
`;
