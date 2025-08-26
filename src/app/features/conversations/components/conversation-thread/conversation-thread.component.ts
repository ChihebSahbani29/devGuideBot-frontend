import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Message } from '../../conversations.types';

@Component({
  selector: 'app-conversation-thread',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './conversation-thread.component.html',
  styleUrl: './conversation-thread.component.scss'
})
export class ConversationThreadComponent {
  @Input({ required: true }) messages: Message[] = [];
  @Input() limit?: number; // show last N messages if provided

  get visibleMessages(): Message[] {
    if (!this.limit || this.limit <= 0) return this.messages;
    const len = this.messages.length;
    const start = Math.max(0, len - this.limit);
    return this.messages.slice(start);
  }
}
