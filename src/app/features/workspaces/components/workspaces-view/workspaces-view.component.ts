import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Workspace } from '../../workspaces.types';

@Component({
  selector: 'talan-workspaces-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './workspaces-view.component.html',
  styleUrl: './workspaces-view.component.scss',
})
export class WorkspacesViewComponent {
  // signal-based inputs/outputs (Angular 17+)
  readonly workspaces = input<Workspace[]>([]);
  readonly total = input<number>(0);
  readonly select = output<Workspace>();

  onClick(ws: Workspace) {
    this.select.emit(ws);
  }
}
