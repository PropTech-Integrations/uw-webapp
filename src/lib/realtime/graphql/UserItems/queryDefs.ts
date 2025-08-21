export const Q_LIST = `
query List($limit:Int) {
  listUserItems(limit:$limit) {
    items { sk entityType entityId data createdAt }
    nextToken
  }
}`;

export const S_CREATE = `
subscription OnCreate {
  onCreateUserItem { sk entityType entityId data createdAt }
}`;

export const S_UPDATE = `
subscription OnUpdate {
  onUpdateUserItem { sk entityType entityId data createdAt }
}`;

export const S_DELETE = `
subscription OnDelete {
  onDeleteUserItem { sk entityType entityId data createdAt }
}`;

export const Q_LIST_USER_PROJECTS = `
query listUserProjects {
  queryUserItemsByEntityTypeUserIdIndex(entityType: "PROJECT") {
    items {
      sk
      entityType
      entityId
      data
      createdAt
    }
  }
}`;
