export const S_CREATE_PROJECT = `
subscription subCreateProject {
  onProjectCreated {
    id
    name
    address
    city
    state
    zip
    country
    assetType
    createdAt
    description
    documents {
      id
      filename
    }
    image
    isActive
    members
    ownerId
    status
    tags
    updatedAt
    isArchived
    isDeleted
    isPublic
  }
}

`;

export const S_DELETE_PROJECT = `
  subscription subDeleteProject {
    onProjectDeleted {
    id
    name
    address
    city
    state
    zip
    country
    assetType
    createdAt
    description
    documents {
      id
      filename
    }
    image
    isActive
    members
    ownerId
    status
    tags
    updatedAt
    isArchived
    isDeleted
    isPublic
  }
}`;

export const S_UPDATE_PROJECT = `
  subscription subUpdateProject {
    onProjectUpdated {
      id
      name
      address
      city
      state
      zip
      country
      assetType 
      createdAt
      description
      documents {
        id
        filename
      }
      image
      isActive
      members
      ownerId
      status        
      tags
      updatedAt
      isArchived
      isDeleted
      isPublic
    }
  }
`;
