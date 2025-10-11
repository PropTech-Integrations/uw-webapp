const result = {
	top_logprobs: 0,
	instructions: null,
	metadata: {},
	max_tool_calls: null,
	reasoning: {
		summary: null,
		effort: 'medium'
	},
	usage: {
		input_tokens_details: {
			cached_tokens: 0
		},
		total_tokens: 16869,
		output_tokens: 3196,
		input_tokens: 13673,
		output_tokens_details: {
			reasoning_tokens: 3008
		}
	},
	created_at: 1760201333,
	safety_identifier: null,
	error: null,
	tools: [
		{
			vector_store_ids: ['vs_68da2c6862088191a5b51b8b4566b300'],
			max_num_results: 20,
			ranking_options: {
				score_threshold: 0,
				ranker: 'auto'
			},
			filters: null,
			type: 'file_search'
		}
	],
	billing: {
		payer: 'developer'
	},
	output: [
		{
			summary: [],
			id: 'rs_02938886deb5b2c00068ea8a75eea881949181d3b577e1af1e',
			type: 'reasoning'
		},
		{
			id: 'fs_02938886deb5b2c00068ea8a77b2fc8194b520aa7b836d88b2',
			type: 'file_search_call',
			queries: [
				'Extract the details from the file',
				'project details asset type address city state zip country from file',
				'project details from uploaded file'
			],
			results: null,
			status: 'completed'
		},
		{
			summary: [],
			id: 'rs_02938886deb5b2c00068ea8a79a8f88194a29390ea4eab04b7',
			type: 'reasoning'
		},
		{
			role: 'assistant',
			id: 'msg_02938886deb5b2c00068ea8a8b5f48819486147b4addde2d64',
			type: 'message',
			content: [
				{
					annotations: [
						{
							filename: 'Lone Oak Shopping Center - OM.pdf',
							file_id: 'file-8KD3dB6vXk7aKKL69ZuAqT',
							index: 445,
							type: 'file_citation'
						},
						{
							filename: 'Lone Oak Shopping Center - OM.pdf',
							file_id: 'file-8KD3dB6vXk7aKKL69ZuAqT',
							index: 446,
							type: 'file_citation'
						}
					],
					parsed: {
						zip: '78220',
						country: 'USA',
						address: '907-1015 S. WW White Road',
						city: 'San Antonio',
						name: 'Lone Oak Shopping Center',
						description:
							'Lone Oak Shopping Center is a 104,485 SF grocery-anchored neighborhood shopping center located at 907-1015 S. WW White Road, San Antonio, TX 78220. The center is anchored by H-E-B and features tenants such as Citi Trends, Hibbett Sports, Metro by T-Mobile, Smile Center, Beauty Plus, Laundry Express, Ace Cash, Las Quesabrosaz, and more, with 100% occupancy reported in the Offering Memorandum.  ',
						state: 'TX',
						assetType: 'Shopping Center'
					},
					text: '{"name":"Lone Oak Shopping Center","description":"Lone Oak Shopping Center is a 104,485 SF grocery-anchored neighborhood shopping center located at 907-1015 S. WW White Road, San Antonio, TX 78220. The center is anchored by H-E-B and features tenants such as Citi Trends, Hibbett Sports, Metro by T-Mobile, Smile Center, Beauty Plus, Laundry Express, Ace Cash, Las Quesabrosaz, and more, with 100% occupancy reported in the Offering Memorandum.  ","address":"907-1015 S. WW White Road","city":"San Antonio","state":"TX","zip":"78220","country":"USA","assetType":"Shopping Center"}',
					type: 'output_text',
					logprobs: []
				}
			],
			status: 'completed'
		}
	],
	top_p: 1,
	previous_response_id: null,
	temperature: 1,
	tool_choice: 'auto',
	model: 'gpt-5-nano-2025-08-07',
	service_tier: 'default',
	id: 'resp_02938886deb5b2c00068ea8a74fba88194af378860d84d27ac',
	text: {
		format: {
			schema: {
				additionalProperties: false,
				type: 'object',
				properties: {
					zip: { type: 'string' },
					country: { type: 'string' },
					address: { type: 'string' },
					city: { type: 'string' },
					name: { type: 'string' },
					description: { type: 'string' },
					state: { type: 'string' },
					assetType: { type: 'string' }
				},
				required: ['name', 'description', 'address', 'city', 'state', 'zip', 'country', 'assetType']
			},
			name: 'projectDetails',
			description: null,
			type: 'json_schema',
			strict: true
		},
		verbosity: 'medium'
	},
	incomplete_details: null,
	prompt_cache_key: null,
	truncation: 'disabled',
	output_parsed: {
		zip: '78220',
		country: 'USA',
		address: '907-1015 S. WW White Road',
		city: 'San Antonio',
		name: 'Lone Oak Shopping Center',
		description:
			'Lone Oak Shopping Center is a 104,485 SF grocery-anchored neighborhood shopping center located at 907-1015 S. WW White Road, San Antonio, TX 78220. The center is anchored by H-E-B and features tenants such as Citi Trends, Hibbett Sports, Metro by T-Mobile, Smile Center, Beauty Plus, Laundry Express, Ace Cash, Las Quesabrosaz, and more, with 100% occupancy reported in the Offering Memorandum.  ',
		state: 'TX',
		assetType: 'Shopping Center'
	},
	store: true,
	parallel_tool_calls: true,
	background: false,
	output_text:
		'{"name":"Lone Oak Shopping Center","description":"Lone Oak Shopping Center is a 104,485 SF grocery-anchored neighborhood shopping center located at 907-1015 S. WW White Road, San Antonio, TX 78220. The center is anchored by H-E-B and features tenants such as Citi Trends, Hibbett Sports, Metro by T-Mobile, Smile Center, Beauty Plus, Laundry Express, Ace Cash, Las Quesabrosaz, and more, with 100% occupancy reported in the Offering Memorandum.  ","address":"907-1015 S. WW White Road","city":"San Antonio","state":"TX","zip":"78220","country":"USA","assetType":"Shopping Center"}',
	user: null,
	object: 'response',
	status: 'completed',
	max_output_tokens: null
};

let parsedResult;
try {
	parsedResult = result.output_parsed;
	console.log(parsedResult);
	if (parsedResult === undefined) {
		throw new Error('Parsed result is undefined.');
	}
} catch (error) {
	console.error('Error parsing result:', error);
	parsedResult = null;
}
