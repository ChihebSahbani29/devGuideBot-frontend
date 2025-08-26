import { Injectable, signal, WritableSignal } from '@angular/core';
import { Conversation, Message } from './conversations.types';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private genId(): string {
    // Simple random ID (not crypto-strong)
    return 'id-' + Math.random().toString(36).slice(2) + Date.now().toString(36);
  }
  // One writable signal per workspaceId
  private readonly stores = new Map<string, WritableSignal<Conversation[]>>();

  private storageKey(wsId: string) { return `chat.conversations.${wsId}`; }
  private load(wsId: string): Conversation[] {
    try {
      const raw = localStorage.getItem(this.storageKey(wsId));
      if (!raw) return [];
      const parsed = JSON.parse(raw) as Conversation[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  private save(wsId: string, value: Conversation[]) {
    try { localStorage.setItem(this.storageKey(wsId), JSON.stringify(value)); } catch {}
  }

  conversations(workspaceId: string) {
    let s = this.stores.get(workspaceId);
    if (!s) {
      s = signal<Conversation[]>(this.load(workspaceId));
      this.stores.set(workspaceId, s);
    }
    return {
      get: () => s!(),
      set: (v: Conversation[]) => { s!.set(v); this.save(workspaceId, v); },
      update: (updater: (cur: Conversation[]) => Conversation[]) => {
        const next = updater(s!());
        s!.set(next);
        this.save(workspaceId, next);
      },
      signal: s!,
    };
  }

  createConversation(workspaceId: string, title: string, firstMessage?: Message): Conversation {
    const conv: Conversation = {
      id: this.genId(),
      title,
      workspaceId,
      createdAt: Date.now(),
      messages: firstMessage ? [firstMessage] : [],
    };
    const s = this.conversations(workspaceId);
    s.set([conv, ...s.get()]);
    return conv;
  }

  addMessage(workspaceId: string, conversationId: string, msg: Message) {
    const s = this.conversations(workspaceId);
    s.update(list => list.map(c => c.id === conversationId ? { ...c, messages: [...c.messages, msg] } : c));
  }

  // Simulate SSE token streaming for assistant message
  streamAssistantReply(
    workspaceId: string,
    conversationId: string,
    fullText: string,
    tokenMs = 35,
    onComplete?: () => void,
  ) {
    const msgId = this.genId();
    // Start with empty assistant message, append tokens
    this.addMessage(workspaceId, conversationId, {
      id: msgId,
      role: 'assistant',
      content: '',
      createdAt: Date.now(),
    });

    const tokens = fullText.split(/(\s+)/); // keep spaces
    let i = 0;
    const interval = setInterval(() => {
      i++;
      const partial = tokens.slice(0, i).join('');
      const s = this.conversations(workspaceId);
      s.update(list => list.map(c => {
        if (c.id !== conversationId) return c;
        return {
          ...c,
          messages: c.messages.map(m => m.id === msgId ? { ...m, content: partial } : m)
        };
      }));
      if (i >= tokens.length) {
        clearInterval(interval);
        if (onComplete) onComplete();
      }
    }, tokenMs);
  }
}
