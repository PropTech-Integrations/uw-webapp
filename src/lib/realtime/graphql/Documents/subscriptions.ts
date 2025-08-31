export const S_CREATE_DOCUMENT = `
subscription subCreateDocument {
  onDocumentCreated {
    id
    filename
    docHash
    createdAt
    updatedAt
    s3Bucket
    s3Key
  }
}
`;

export const S_UPDATE_DOCUMENT = `
subscription subUpdateDocument {
  onDocumentUpdated {
    id
    filename
    docHash
    createdAt
    updatedAt
    s3Bucket
    s3Key
  }
}
`;

export const S_DELETE_DOCUMENT = `
subscription subDeleteDocument {
  onDocumentDeleted {
    id
    filename
    docHash
    createdAt
    updatedAt
    s3Bucket
    s3Key
  }
}
`;
