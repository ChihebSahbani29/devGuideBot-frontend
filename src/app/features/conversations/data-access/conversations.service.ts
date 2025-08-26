import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CreateConversationPayload {
  title: string;
  message: string;
}

export interface BackendMessage {
  question: string;
  answer: string;
  timestamp: string; // ISO
}

export interface CreateConversationResponse {
  id: string;
  workspace_id: string;
  title: string;
  messages: BackendMessage[];
  created_at: string; // ISO
  updated_at: string; // ISO
}

export interface AddMessagePayload {
  question: string;
  answer: string;
  timestamp: string; // ISO
}

export interface ListConversationsResponse {
  conversations: CreateConversationResponse[];
}

// Chat endpoint
export interface ChatRequest {
  message: string;
  source_types: string[];
  source_ids: string[];
  max_results: number;
  temperature: number;
  max_tokens: number;
  stream: boolean;
  system_prompt: string;
}

export interface ChatDocument {
  document_id: string;
  source: string;
  title: string;
  url: string | null;
  content: string;
  similarity_score: number | null;
}

export interface ChatResponse {
  response: string;
  conversation_id: string;
  documents: ChatDocument[];
}

@Injectable({ providedIn: 'root' })
export class ConversationsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:8000';

  createConversation(
    workspaceId: string,
    payload: CreateConversationPayload
  ): Observable<CreateConversationResponse> {
    return this.http.post<CreateConversationResponse>(
      `${this.baseUrl}/conversations/${workspaceId}/conversations/`,
      payload
    );
  }

  addMessage(
    workspaceId: string,
    conversationId: string,
    payload: AddMessagePayload,
  ): Observable<CreateConversationResponse> {
    return this.http.post<CreateConversationResponse>(
      `${this.baseUrl}/conversations/${workspaceId}/conversations/${conversationId}/messages`,
      payload,
    );
  }

  listConversations(workspaceId: string): Observable<ListConversationsResponse> {
    return this.http.get<ListConversationsResponse>(
      `${this.baseUrl}/conversations/${workspaceId}/conversations/`
    );
  }

  chat(
    workspaceId: string,
    conversationId: string,
    payload: ChatRequest,
  ): Observable<ChatResponse> {
    const qs = `workspace_id=${encodeURIComponent(workspaceId)}&conversation_id=${encodeURIComponent(conversationId)}`;
    return this.http.post<ChatResponse>(
      `${this.baseUrl}/chat/?${qs}`,
      payload,
    );
  }
}