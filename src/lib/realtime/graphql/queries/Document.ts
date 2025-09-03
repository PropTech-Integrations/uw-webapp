export const Q_GET_DOCUMENT_AND_PAGES = `
    query getDocumentPage($docHash: ID!) {
    getDocument(
      docHash: $docHash
    ) {
      pages {
        items {
          id
          docHash
          pageNumber
        }
      }
      docHash
      createdAt
      s3Bucket
      s3Key
    }
  }
`;

// query getDocument {
//     getDocument(
//       docHash: "37b4e46cc488315284a527794ea30c159e4cf48f52e5fc575d492c5d43511ba9"
//     ) {
//       pages {
//         items {
//           id
//           docHash
//           pageNumber
//         }
//       }
//       docHash
//       createdAt
//       s3Bucket
//       s3Key
//     }
//   }