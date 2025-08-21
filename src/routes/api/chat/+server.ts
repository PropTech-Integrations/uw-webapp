import type { RequestHandler } from '../../chat/$types';
import { json } from '@sveltejs/kit';
import { OPENAI_API_KEY, OPENAI_BASE_URL } from '$env/static/private';

const DEFAULT_MODEL = 'gpt-4o-nano'; // change as you like

// Valid roles for OpenAI API
const VALID_ROLES = ['system', 'user', 'assistant', 'function', 'tool', 'developer'];

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { messages, model = DEFAULT_MODEL } = await request.json();

		if (!OPENAI_API_KEY) {
			return json({ error: 'Server misconfigured: OPENAI_API_KEY is missing.' }, { status: 500 });
		}

		// Filter out messages with invalid roles and log them for debugging
		const validMessages = messages.filter((msg: any) => {
			if (!VALID_ROLES.includes(msg.role)) {
				console.warn(`Filtering out message with invalid role: ${msg.role}`, msg);
				return false;
			}
			return true;
		});

		// OpenAI Chat Completions (simple non-streaming for reliability)
		const resp = await fetch(`${OPENAI_BASE_URL || 'https://api.openai.com'}/v1/chat/completions`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${OPENAI_API_KEY}`
			},
			body: JSON.stringify({
				model,
				messages: validMessages,
				temperature: 0.2
			})
		});

		if (!resp.ok) {
			const errText = await resp.text().catch(() => '');
			return json({ error: `Upstream error: ${resp.status} ${errText}` }, { status: 500 });
		}

		const data = await resp.json();
		const reply = data.choices?.[0]?.message?.content ?? '';
		return json({ reply });
	} catch (err: any) {
		return json({ error: err?.message ?? 'Unknown server error' }, { status: 500 });
	}
};
