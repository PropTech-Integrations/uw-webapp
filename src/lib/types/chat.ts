export type Role = 'system' | 'user' | 'StratiqAI';

export type ChatMessage = {
  role: Role;
  content: string;
  id?: string;
  ts?: string;
  pending?: boolean;
};

export type AIAction =
  | { type: 'add_task'; payload: { title: string; status?: 'todo'|'doing'|'done' } }
  | { type: 'update_task'; payload: { id: string; title?: string; status?: 'todo'|'doing'|'done' } }
  | { type: 'delete_task'; payload: { id: string } }
  | { type: 'move_task'; payload: { id: string; to: 'todo'|'doing'|'done' } };

// Extract fenced ```action ... ``` blocks from an assistant reply
export function parseActionsFromReply(reply: string): AIAction[] {
  const actions: AIAction[] = [];
  const regex = /```action\s*([\s\S]*?)```/gi;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(reply)) !== null) {
    try {
      const obj = JSON.parse(m[1].trim());
      if (obj && typeof obj === 'object' && obj.type) actions.push(obj as AIAction);
    } catch { /* ignore parse errors */ }
  }
  return actions;
}
