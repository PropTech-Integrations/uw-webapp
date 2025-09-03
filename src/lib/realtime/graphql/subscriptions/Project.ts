export const S_PROJECT_CREATED = `
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



export const S_PROJECT_UPDATED = `
  subscription OnProjectUpdated {
    onProjectUpdated {
      address
      assetType
      city
      country
      createdAt
      description
      documents {
        filename
        id
      }
      id
      image
      isActive
      isArchived
      isDeleted
      isPublic
      members
      name
      ownerId
      state
      status
      tags
      updatedAt
      zip
    }
  }
`;


export const S_PROJECT_DELETED = `
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



export const S_PROJECT_UPDATED_BY_ID = `
  subscription OnProjectUpdated($id: ID!) {
    onProjectUpdated(id: $id) {
      address
      assetType
      city
      country
      createdAt
      description
      documents {
        filename
        id
      }
      id
      image
      isActive
      isArchived
      isDeleted
      isPublic
      members
      name
      ownerId
      state
      status
      tags
      updatedAt
      zip
    }
  }
`;
