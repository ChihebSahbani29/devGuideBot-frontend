import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Conversation } from '../../conversations.types';

@Component({
  selector: 'app-conversation-list',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './conversation-list.component.html',
})
export class ConversationListComponent {
  @Input({ required: true }) items: Conversation[] = [];
  @Input() selectedId?: string;
  @Output() select = new EventEmitter<string>();
}
