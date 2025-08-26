import { Component, EventEmitter, Output, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-new-conversation-composer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './new-conversation-composer.component.html',
})
export class NewConversationComposerComponent {
  text = '';
  @Output() submitText = new EventEmitter<string>();
  @Input() disabled = false;
  @Input() placeholder = 'Ask something about this workspace...';

  onSubmit() {
    if (this.disabled) return;
    const value = this.text.trim();
    if (!value) return;
    this.submitText.emit(value);
    this.text = '';
  }

  onKeydown(ev: KeyboardEvent) {
    if (this.disabled) return;
    if (ev.key === 'Enter' && !ev.shiftKey) {
      ev.preventDefault();
      this.onSubmit();
    }
  }
}
