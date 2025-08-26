import { Component, EventEmitter, Input, Output, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'talan-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pagination.component.html',
})
export class PaginationComponent {
  // Inputs
  @Input({ required: true }) total = 0;
  @Input({ required: true }) page = 1; // 1-based
  @Input({ required: true }) pageSize = 6;
  @Input() pageSizeOptions: number[] = [4, 6, 8, 12];

  // Outputs
  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();

  // Derived
  totalPages = computed(() => Math.max(1, Math.ceil(this.total / this.pageSize)));

  get startIndex(): number {
    if (this.total === 0) return 0;
    return (this.page - 1) * this.pageSize + 1;
  }
  get endIndex(): number {
    return Math.min(this.total, this.page * this.pageSize);
  }

  toPage(p: number) {
    const tp = this.totalPages();
    const next = Math.min(Math.max(1, p), tp);
    if (next !== this.page) this.pageChange.emit(next);
  }
  next() { this.toPage(this.page + 1); }
  prev() { this.toPage(this.page - 1); }
  first() { this.toPage(1); }
  last() { this.toPage(this.totalPages()); }

  changeSize(size: number) {
    if (size !== this.pageSize) this.pageSizeChange.emit(size);
  }

  // Template-friendly handler to avoid complex casts in HTML
  onSizeChange(event: Event) {
    const target = event.target as HTMLSelectElement | null;
    if (!target) return;
    const raw = target.value;
    const parsed = Number(raw);
    if (!Number.isNaN(parsed) && parsed > 0) {
      this.changeSize(parsed);
    }
  }

  // Render a compact window of page buttons around current page
  get pages(): number[] {
    const total = this.totalPages();
    const window = 2; // pages on each side
    const start = Math.max(1, this.page - window);
    const end = Math.min(total, this.page + window);
    const list: number[] = [];
    for (let i = start; i <= end; i++) list.push(i);
    return list;
  }
}
