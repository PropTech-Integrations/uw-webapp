export const M_CREATE_PROJECT = `
    mutation createProject($input: CreateProjectInput!) {
        createProject(input: $input) {
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

export const M_DELETE_PROJECT = `
    mutation deleteProject($input: DeleteProjectInput!) {
        deleteProject(input: $input) {
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