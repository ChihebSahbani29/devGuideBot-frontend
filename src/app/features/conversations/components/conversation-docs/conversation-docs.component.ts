import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatDocument } from '../../data-access/conversations.service';
import { Message } from '../../conversations.types';

@Component({
  selector: 'app-conversation-docs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './conversation-docs.component.html',
})
export class ConversationDocsComponent {
  @Input() documents: ChatDocument[] = [];
  @Input() messages: Message[] = [];
  @Input() latestAssistantMessageId: string | null = null;

  get shouldShowDocuments(): boolean {
    if (!this.latestAssistantMessageId) return false;
    
    const latestMessage = this.messages.find(m => m.id === this.latestAssistantMessageId);
    // Only show documents if the latest message is from assistant and not in loading state
    return latestMessage?.role === 'assistant' && latestMessage?.content !== '...';
  }
}
