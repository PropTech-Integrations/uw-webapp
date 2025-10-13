// OpenAI Queries Definitions
import { z } from 'zod';

// OpenAI Queries require information about the structure of the response, a system prompt, and a user prompt,
// and the priority of the request and the AI model to use.
import { getWidgetTextFormat, ParagraphWidgetDataSchema } from '$lib/dashboard/types/widgetSchemas';

export const paragraphTitleQuery = (customPrompt?: string, model: string = 'gpt-5-nano') => {
	const textFormat = getWidgetTextFormat('paragraph', 'ParagraphContent');

	return {
		request: JSON.stringify({
			model,
			input: [
				{
					role: 'system',
					content: `You are a helpful assistant that writes clear, informative paragraphs. 
                    Structure your response with:
                    - A concise, descriptive title
                    - Well-formatted content (use markdown if it improves readability)
                    - Set markdown: true if you use markdown formatting`
				},
				{
					role: 'user',
					content: customPrompt || prompt
				}
			],
			text: {
				format: textFormat
			}
		}),
		priority: 'HIGH' as const
	};
};

export type paragraphTitleAIQuery = z.infer<typeof ParagraphWidgetDataSchema>;
