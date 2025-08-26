import { Component, computed, signal, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { Workspace } from './workspaces.types';
import { WorkspacesViewComponent } from './components/workspaces-view/workspaces-view.component';
import { PaginationComponent } from '../../shared/pagination/pagination.component';
import { Router, RouterModule } from '@angular/router';
import { LoaderComponent } from '../../shared/loader/loader.component';
import { EmptyStateComponent } from './components/empty-state/empty-state.component';
import { HttpClientModule } from '@angular/common/http';
import { WorkspacesService, type WorkspaceResponse } from './data-access/workspaces.service';

@Component({
  selector: 'app-workspaces',
  standalone: true,
  imports: [CommonModule, RouterModule, HttpClientModule, WorkspacesViewComponent, PaginationComponent, LoaderComponent, EmptyStateComponent],
  templateUrl: './workspaces.component.html',
  styleUrl: './workspaces.component.scss',
})
export class WorkspacesComponent implements OnInit, OnDestroy {
  readonly loading = signal(true);
  readonly workspaces = signal<Workspace[]>([]);

  readonly total = computed(() => this.workspaces().length);
  readonly page = signal(1); // 1-based
  readonly pageSize = signal(4);

  readonly paginated = computed(() => {
    const p = this.page();
    const ps = this.pageSize();
    const start = (p - 1) * ps;
    return this.workspaces().slice(start, start + ps);
  });

  private readonly router = inject(Router);
  private readonly workspacesService = inject(WorkspacesService);

  onSelect = (ws: Workspace) => {
    this.router.navigate([`/workspaces/${ws.id}/conversations`], { state: { workspace: ws } });
  };

  onPageChange = (p: number) => {
    this.page.set(p);
  };

  onPageSizeChange = (ps: number) => {
    this.pageSize.set(ps);
    this.page.set(1);
  };

  private mq?: MediaQueryList;
  private onMediaChange = (e: MediaQueryListEvent) => {
    this.pageSize.set(e.matches ? 4 : 2);
    this.page.set(1);
  };

  ngOnInit(): void {
    if (typeof window !== 'undefined' && 'matchMedia' in window) {
      this.mq = window.matchMedia('(min-width: 768px)');
      this.pageSize.set(this.mq.matches ? 4 : 2);
      if ('addEventListener' in this.mq) {
        this.mq.addEventListener('change', this.onMediaChange);
      } else {
        // @ts-ignore
        this.mq.addListener(this.onMediaChange);
      }
    }
    this.loading.set(true);
    this.workspacesService.getWorkspaces().subscribe({
      next: (items: WorkspaceResponse[]) => {
        this.workspaces.set(items as unknown as Workspace[]);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load workspaces', err);
        this.workspaces.set([]);
        this.loading.set(false);
      },
    });
  }

  ngOnDestroy(): void {
    if (this.mq) {
      if ('removeEventListener' in this.mq) {
        this.mq.removeEventListener('change', this.onMediaChange);
      } else {
        // @ts-ignore
        this.mq.removeListener(this.onMediaChange);
      }
    }
  }
}
