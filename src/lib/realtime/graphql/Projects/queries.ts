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