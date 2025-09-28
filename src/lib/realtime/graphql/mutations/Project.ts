import type { Project } from '$lib/types/Project';
import { gql } from '$lib/realtime/graphql/requestHandler';

export const M_CREATE_PROJECT = `
    mutation createProject($input: CreateProjectInput!) {
        createProject(input: $input) {
            name
            address
            description
            city
            state
            zip
            country
            assetType
            documents {
              id
              filename
            }
            image
            isActive
            members            
            status
            tags
            isArchived
            isDeleted
            isPublic
        }
    }
`;

export const M_UPDATE_PROJECT_DOCUMENTS = `
    mutation updateProjectDocuments ($input: UpdateProjectDocumentsInput!) {
        updateProjectDocuments(input: $input) {
            id
            documents {
                id
                filename
                openAIFileId
            }
        }
    }
`;

export const M_UPDATE_PROJECT = `
    mutation updateProject($input: UpdateProjectInput!) {
        updateProject(input: $input) {
            id
            name
            description
            image
            address
            city
            state
            zip
            country
            assetType
            status  
            isActive    
            isArchived
            isDeleted
            isPublic
            members
            documents {
              id
              filename
            }
            createdAt
            updatedAt
            ownerId
            tags
        }
    }
`;

export const M_UPDATE_PROJECT2 = `
mutation updateProject($input: UpdateProjectInput!) {
  updateProject(input: $input) {
    id
    name
    description
    image
    address
    city
    state
    zip
    country
    assetType
    status
    isActive
    isArchived
    isDeleted
    isPublic
    members
    documents {
      id
      filename
    }
    createdAt
    updatedAt
    ownerId
    tags
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

export async function updateProject(project: Project, idToken: string) {
	const mutation = M_UPDATE_PROJECT;
	// Extract only the fields that can be updated according to UpdateProjectInput
	const input = {
		id: project.id,
		name: project.name,
		description: project.description,
		image: project.image,
		address: project.address,
		city: project.city,
		state: project.state,
		zip: project.zip,
		country: project.country,
		assetType: project.assetType,
		status: project.status,
		isActive: project.isActive,
		isArchived: project.isArchived,
		isDeleted: project.isDeleted,
		isPublic: project.isPublic,
		members: project.members,
		documents: project.documents,
		tags: project.tags
	};
	// console.log('input', JSON.stringify(input, null, 2));
	try {
		const res = await gql<{ updateProject: Project }>(mutation, { input }, idToken);
		return res.updateProject;
	} catch (e) {
		console.error('Error updating project:', e);
		throw e;
	}
}
