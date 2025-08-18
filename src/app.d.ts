// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
import type { CurrentUser } from '$lib/types/auth';
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			currentUser?: CurrentUser;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
