import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatDocument } from '../../data-access/conversations.service';

@Component({
  selector: 'app-conversation-docs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './conversation-docs.component.html',
})
export class ConversationDocsComponent {
  @Input({ required: true }) documents: ChatDocument[] = [];
}
