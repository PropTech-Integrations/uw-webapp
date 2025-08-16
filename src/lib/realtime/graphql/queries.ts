export const Q_LIST = `
query List($limit:Int) {
  listUserItems(limit:$limit) {
    items { userId sk entityType entityId data createdAt }
    nextToken
  }
}`;

export const S_CREATE = `
subscription OnCreate {
  onCreateUserItem { userId sk entityType entityId data createdAt }
}`;

export const S_UPDATE = `
subscription OnUpdate {
  onUpdateUserItem { userId sk entityType entityId data createdAt }
}`;

export const S_DELETE = `
subscription OnDelete {
  onDeleteUserItem { userId sk entityType entityId data createdAt }
}`;
