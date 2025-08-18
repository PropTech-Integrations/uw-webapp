export type Project = {
  id: string;   // A unique identifier for the project
  name: string; // The name of the project
  address: string; // The address of the project
  assetType: string; // The asset type of the project
  city?: string; // The city of the project
  state?: string; // The state of the project
  zip?: string; // The zip code of the project
  country?: string; // The country of the project
  image?: string; // The image of the project
  description?: string; // A description of the project
  ownerId: string; // The AWS Cognito ID of the user who owns the project
  createdAt: string; // The date and time the project was created
  updatedAt?: string; // The date and time the project was last updated
  status?: 'Active' | 'Archived' | 'Deleted'; // The status of the project
  members?: string[]; // The email addresses of the users who are members of the project
  tags?: string[]; // The tags of the project
  isPublic?: boolean; // Whether the project is public
  isArchived?: boolean; // Whether the project is archived
  isDeleted?: boolean; // Whether the project is deleted
  isActive?: boolean; // Whether the project is active
  id_token:string; // The ID token of the user who owns the project
  access_token:string; // The access token of the user who owns the project
  refresh_token:string; // The refresh token of the user who owns the project
}