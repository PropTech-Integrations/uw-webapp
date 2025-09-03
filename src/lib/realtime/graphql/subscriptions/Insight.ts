export const S_CREATE_INSIGHT = `
  subscription OnCreateInsight($docHash: ID, $pageId: ID, $textId: ID, $imageId: ID) {
    onCreateInsight(docHash: $docHash, pageId: $pageId, textId: $textId, imageId: $imageId) {
      category
      confidence
      createdAt
      docHash
      hash
      imageId
      model
      name
      pageId
      textId
      type
      value
    }
  }
`;
