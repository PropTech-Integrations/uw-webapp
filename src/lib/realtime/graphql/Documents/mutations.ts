import type { Project } from "$lib/types/Project";

import { gql } from "$lib/realtime/websocket/AppSyncWsClient";

export const M_UPDATE_DOCUMENT = `
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
      documents
      tags
    }
  }
`;


