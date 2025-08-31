export const S_CREATE_PAGE = `
subscription subCreatePage {
  onPageCreated {
    id
    docHash
    pageNumber
    createdAt
    updatedAt
  }
}
`;

export const S_UPDATE_PAGE = `
subscription subUpdatePage {
  onPageUpdated {
    id
    docHash
    pageNumber
    createdAt
    updatedAt
  }
}
`;

export const S_DELETE_PAGE = `
subscription subDeletePage {
  onPageDeleted {
    id
    docHash
    pageNumber
    createdAt
    updatedAt
  }
}
`;
