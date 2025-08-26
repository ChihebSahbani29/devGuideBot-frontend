import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import type { Workspace } from '../workspaces/workspaces.types';
import { ChatService } from './chat.service';
import { Conversation } from './conversations.types';
import { signal, computed, inject } from '@angular/core';
import { ConversationListComponent } from './components/conversation-list/conversation-list.component';
import { ConversationThreadComponent } from './components/conversation-thread/conversation-thread.component';
import { NewConversationComposerComponent } from './components/new-conversation-composer/new-conversation-composer.component';
import { ConversationsService, CreateConversationResponse, ChatDocument } from './data-access/conversations.service';
import { ConversationDocsComponent } from './components/conversation-docs/conversation-docs.component';

@Component({
  selector: 'app-conversations',
  standalone: true,
  imports: [CommonModule, RouterModule, HttpClientModule, ConversationListComponent, ConversationThreadComponent, ConversationDocsComponent, NewConversationComposerComponent],
  templateUrl: './conversations.component.html',
  styleUrl: './conversations.component.scss'
})
export class ConversationsComponent implements OnInit {
  readonly workspaceId: string;
  readonly workspace?: Workspace;
  private readonly chat = inject(ChatService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(ConversationsService);

  // Conversations list signal for this workspace
  readonly conversationsSig = this.chat.conversations((this.route.snapshot.paramMap.get('id') ?? ''));
  readonly conversations = computed(() => this.conversationsSig.get());

  // Selection
  readonly selectedId = signal<string | undefined>(undefined);
  readonly selected = computed<Conversation | undefined>(() =>
    this.conversations().find(c => c.id === this.selectedId())
  );

  // Streaming flag (disable composer while assistant is streaming)
  readonly isStreaming = signal(false);

  // Last chat response documents
  readonly lastDocs = signal<ChatDocument[]>([]);

  // Data source multi-selection for new questions
  readonly dataSources = ['Jira', 'GitHub', 'Other'] as const;
  readonly selectedSources = signal<string[]>(['GitHub']);
  isSelected = (src: string) => this.selectedSources().includes(src);
  toggleSource(src: string, checked: boolean) {
    const cur = this.selectedSources();
    this.selectedSources.set(
      checked ? Array.from(new Set([...cur, src])) : cur.filter(s => s !== src)
    );
  }
  private selectedSourcesLabel() { return this.selectedSources().join(', ') || 'None'; }

  constructor(route: ActivatedRoute) {
    this.workspaceId = this.route.snapshot.paramMap.get('id') ?? '';
    const st = (history?.state ?? {}) as { workspace?: Workspace };
    this.workspace = st.workspace;

    // Keep selectedId in sync with :cid in the URL
    this.route.paramMap.subscribe(pm => {
      const cid = pm.get('cid') ?? undefined;
      this.selectedId.set(cid);
    });
  }

  ngOnInit(): void {
    // Load previous conversations from backend for this workspace
    this.api.listConversations(this.workspaceId).subscribe({
      next: (res) => {
        const mapped: Conversation[] = (res.conversations || []).map((c) => this.mapBackendConversation(c));
        const store = this.chat.conversations(this.workspaceId);
        store.set(mapped);
      },
      error: (err: unknown) => {
        console.error('Failed to load conversations', err);
      },
    });
  }

  private mapBackendConversation(c: CreateConversationResponse): Conversation {
    const msgs = (c.messages || []).flatMap((m) => {
      const ts = Date.parse(m.timestamp ?? new Date().toISOString());
      return [
        { id: 'm-' + Math.random().toString(36).slice(2), role: 'user' as const, content: m.question, createdAt: ts - 1 },
        { id: 'm-' + Math.random().toString(36).slice(2), role: 'assistant' as const, content: m.answer, createdAt: ts },
      ];
    });
    return {
      id: c.id,
      title: c.title,
      workspaceId: this.workspaceId,
      createdAt: Date.parse(c.created_at || new Date().toISOString()),
      messages: msgs,
    };
  }

  onSelectConversation = (id: string) => {
    this.selectedId.set(id);
    // Reflect selection in URL
    this.router.navigate([`/workspaces/${this.workspaceId}/conversations/${id}`]);
  };

  onSubmitText = (text: string) => {
    const src = this.selectedSourcesLabel();
    const prefixed = `${text}`;
    const title = prefixed.length > 60 ? prefixed.slice(0, 57) + '...' : prefixed;

    this.isStreaming.set(true);
    const existingId = this.selectedId();
    if (!existingId) {
      // Create a new conversation
      this.api.createConversation(this.workspaceId, { title, message: prefixed }).subscribe({
        next: (res: CreateConversationResponse) => {
          // Convert backend response to UI Conversation with flattened messages (user+assistant per entry)
          const msgs = (res.messages || []).flatMap((m) => {
            const ts = Date.parse(m.timestamp ?? new Date().toISOString());
            return [
              { id: 'm-' + Math.random().toString(36).slice(2), role: 'user' as const, content: m.question, createdAt: ts - 1 },
              { id: 'm-' + Math.random().toString(36).slice(2), role: 'assistant' as const, content: m.answer, createdAt: ts },
            ];
          });
          const conv: Conversation = {
            id: res.id,
            title: res.title,
            workspaceId: this.workspaceId,
            createdAt: Date.parse(res.created_at || new Date().toISOString()),
            messages: msgs,
          };
          const store = this.chat.conversations(this.workspaceId);
          store.set([conv, ...store.get()]);
          this.selectedId.set(conv.id);
          this.router.navigate([`/workspaces/${this.workspaceId}/conversations/${conv.id}`]);
          this.isStreaming.set(false);
        },
        error: (err: unknown) => {
          console.error('Failed to create conversation', err);
          this.isStreaming.set(false);
        },
      });
    } else {
      // Send message via /chat endpoint and append assistant reply
      this.api.chat(this.workspaceId, existingId, {
        message: prefixed,
        source_types: this.selectedSources().map(s => s.toLowerCase()),
        source_ids: [],
        max_results: 5,
        temperature: 0.7,
        max_tokens: 1000,
        stream: false,
        system_prompt: 'default',
      }).subscribe({
        next: (res) => {
          const store = this.chat.conversations(this.workspaceId);
          const now = Date.now();
          this.lastDocs.set(res.documents || []);
          store.update(list => list.map(c => {
            if (c.id !== existingId) return c;
            return {
              ...c,
              messages: [
                ...c.messages,
                { id: 'm-' + Math.random().toString(36).slice(2), role: 'user' as const, content: prefixed, createdAt: now - 1 },
                { id: 'm-' + Math.random().toString(36).slice(2), role: 'assistant' as const, content: res.response, createdAt: now },
              ]
            };
          }));
          this.isStreaming.set(false);
        },
        error: (err: unknown) => {
          console.error('Failed to chat', err);
          this.isStreaming.set(false);
        },
      });
    }
  };

  onNewConversation() {
    // Clear selection and route back to base conversations path
    this.selectedId.set(undefined);
    this.router.navigate([`/workspaces/${this.workspaceId}/conversations`]);
  }
}
