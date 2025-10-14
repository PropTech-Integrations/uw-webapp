// Enum for status (from your schema)
export type ProjectStatus = 'Active' | 'Inactive' | 'Archived';

export interface ProjectDocument {
	id: string;
	filename: string;
}

export interface Project {
	id: string;
	ownerId: string; // Cognito username or sub
	name: string;
	description?: string | null;
	image?: string | null;
	address?: string | null;
	city?: string | null;
	state?: string | null;
	zip?: string | null;
	country?: string | null;
	assetType?: string | null;
	status: ProjectStatus;
	isActive: boolean;
	isArchived: boolean;
	isDeleted: boolean;
	isPublic: boolean;
	vectorStoreId?: string | null;
	members: string[]; // list of usernames/emails
	documents: ProjectDocument[]; // list of document IDs
	tags: string[];
	createdAt: string; // ISO8601 DateTime
	updatedAt: string; // ISO8601 DateTime
}

export interface ProjectInput extends Omit<Project, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'> {
	name: string;
	description?: string | null;
	image?: string | null;
	address?: string | null;
	city?: string | null;
	state?: string | null;
	zip?: string | null;
	country?: string | null;
}
