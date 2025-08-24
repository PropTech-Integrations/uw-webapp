export const Q_LIST = `
query List($limit:Int) {
  listUserItems(limit:$limit) {
    items { entityType entityId data createdAt }
    nextToken
  }
}`;

export const S_CREATE = `
subscription OnCreate {
  onCreateUserItem { entityType entityId data createdAt }
}`;

export const S_UPDATE = `
subscription OnUpdate {
  onUpdateUserItem { entityType entityId data createdAt }
}`;

export const S_DELETE = `
subscription OnDelete {
  onDeleteUserItem { entityType entityId data createdAt }
}`;

export const Q_LIST_USER_PROJECTS = `
query listUserProjects {
  queryUserItemsByEntityTypeUserIdIndex(entityType: "PROJECT") {
    items {
      entityType
      entityId
      data
      createdAt
    }
  }
}`;
