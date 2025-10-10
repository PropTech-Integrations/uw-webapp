import { z } from 'zod';

export type WidgetType =
	| 'table'
	| 'title'
	| 'paragraph'
	| 'image'
	| 'lineChart'
	| 'barChart'
	| 'metric'
	| 'map';

const projectSchema = z.object({
	name: z.string(),
	description: z.string(),
	address: z.string(),
	city: z.string(),
	state: z.string(),
	zip: z.string(),
	country: z.string(),
	assetType: z.string()
});

const brokerSchema = z.object({
	brokers: z.array(
		z.object({
			company: z.string(),
			name: z.string(),
			city: z.string(),
			state: z.string(),
			country: z.string(),
			phone: z.string(),
			email: z.string(),
			website: z.string()
		})
	)
});
