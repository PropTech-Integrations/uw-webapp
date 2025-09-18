// +page.ts
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent }) => {
  const { project, idToken } = await parent(); // <- data from +layout.server.ts
  
  return {
    project: project,
    idToken: idToken
  };
};