import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'talan-empty-state',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="w-full grid place-items-center text-center py-16">
      <div class="relative">
        <div class="mx-auto mb-5 h-16 w-16 rounded-full bg-white shadow-sm border border-[#00187C]/10 grid place-items-center">
          <div class="h-8 w-8 rounded-full" style="background: conic-gradient(#00187C, #3A3F97, #8F9424, #E04580, #00187C)"></div>
        </div>
        <h2 class="text-[#00187C] text-xl font-light">{{ title || 'No workspaces yet' }}</h2>
        <p class="mt-2 text-[#00187C]/70 text-sm max-w-md">
          {{ description || 'Create your first workspace to organize repositories and knowledge sources.' }}
        </p>
        <div class="mt-6">
          <a routerLink="/workspaces/new" class="inline-flex items-center gap-2 rounded px-4 py-2 text-xs text-white"
             style="background: linear-gradient(90deg, #00187C, #E04580)">
            + New workspace
          </a>
        </div>
      </div>
    </div>
  `,
})
export class EmptyStateComponent {
  @Input() title = '';
  @Input() description = '';
}
