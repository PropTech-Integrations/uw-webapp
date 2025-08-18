// src/routes/+layout.ts
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = ({ data }) => {
  // passthrough—lets $page.data.currentUser work on the client
  return data;
};
