export const Q_LIST_USER_PROJECTS = `
    query listProjects($limit: Int, $nextToken: String) {
        listMyProjects(limit: $limit, nextToken: $nextToken) {
            items {
                zip
                updatedAt
                tags
                status
                state
                ownerId
                name
                members
                isPublic
                isDeleted
                isArchived
                isActive
                image
                id
                documents {
                    id
                    filename
                }
                description
                createdAt
                country
                city
                assetType
                address
            }
            nextToken
        }
    }
  `;

export const Q_GET_PROJECT = `
    query getProject($id: ID!) {
        getProject(id: $id) {
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

export const Q_GET_PROJECT_AND_DOCUMENT = `
  query getDocumentAndProject($docHash: ID!, $projectId: ID!) {
    getDocument(docHash: $docHash) {
      createdAt
      docHash
      s3Bucket
      s3Key
      updatedAt
    }
  
    getProject(id: $projectId) {
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
  