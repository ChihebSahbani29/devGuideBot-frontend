import { Component, signal, inject, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { WorkspacesService, WorkspacePayload } from '../../data-access/workspaces.service';
import { LoaderComponent } from '../../../../shared/loader/loader.component';

@Component({
  selector: 'app-create-workspace',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LoaderComponent],
  templateUrl: './create-workspace.component.html',
})
export class CreateWorkspaceComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly workspaces = inject(WorkspacesService);

  // Splash loader for wow effect
  loading = signal(true);

  // Template-driven form model
  form: any = {
    name: 'Data Governance Workspace',
    description: 'Used for RAG experiments',
    jira: {
      url: 'https://example.com/',
      email: '',
      api_token: '',
      project_key: '',
    },
    confluence: {
      url: 'https://example.com/',
      email: '',
      api_token: '',
      space_key: '',
    },
    sharepoint: {
      site_url: 'https://example.com/',
      client_id: '',
      client_secret: '',
      tenant_id: '',
    },
    github: {
      url: 'https://example.com/',
      access_token: '',
      default_owner: '',
      default_repo: '',
      default_branch: 'develop',
    },
    gitlab: {
      url: 'https://example.com/',
      access_token: '',
      default_owner: '',
      default_repo: '',
      default_branch: 'develop',
    },
  };

  submitting = signal(false);
  // increment when form fields change (to trigger computed re-evaluation)
  formVersion = signal(0);

  // Call this from template (ngModelChange) to trigger validations recompute
  bumpVersion() {
    this.formVersion.update(n => n + 1);
  }

  // Stepper state (1..3)
  step = signal<1 | 2 | 3>(1);
  next = () => this.step.update(s => (s < 3 ? ((s + 1) as 2 | 3) : s));
  back = () => this.step.update(s => (s > 1 ? ((s - 1) as 1 | 2) : s));
  canNext = computed(() => {
    const s = this.step();
    // track changes from inputs
    this.formVersion();
    if (s === 1) return !!this.form.name?.trim();
    if (s === 2) {
      // If GitHub is enabled, ensure it's valid before allowing Next
      if (this.providers().github && !this.githubValid()) return false;
      return true;
    }
    return false;
  });

  ngOnInit(): void {
    // Keep the splash for at least 4 seconds
    setTimeout(() => this.loading.set(false), 4000);
  }

  // Provider enable toggles (Step 2)
  providers = signal({
    jira: false,
    confluence: false,
    sharepoint: false,
    github: true,
    gitlab: false,
  });

  // allow clicking on steps directly
  setStep(n: 1 | 2 | 3): void {
    this.step.set(n);
  }

  toggleProvider(key: 'jira' | 'confluence' | 'sharepoint' | 'github' | 'gitlab'): void {
    const current = { ...this.providers() };
    current[key] = !current[key];
    this.providers.set(current);
  }

  // Quick templates (Step 1)
  selectTemplate(t: 'github_only' | 'atlassian_suite' | 'enterprise_full') {
    const base = this.form;
    if (t === 'github_only') {
      this.providers.set({ jira: false, confluence: false, sharepoint: false, github: true, gitlab: false });
      base.name ||= 'GitHub Workspace';
      base.github.url = base.github.url || 'https://github.com/';
    } else if (t === 'atlassian_suite') {
      this.providers.set({ jira: true, confluence: true, sharepoint: false, github: false, gitlab: false });
      base.name ||= 'Atlassian Workspace';
      base.jira.url = base.jira.url || 'https://your-domain.atlassian.net/';
      base.confluence.url = base.confluence.url || 'https://your-domain.atlassian.net/wiki/';
    } else if (t === 'enterprise_full') {
      this.providers.set({ jira: true, confluence: true, sharepoint: true, github: true, gitlab: false });
      base.name ||= 'Enterprise Workspace';
    }
  }

  // For Step 3 summary
  enabledProviders = computed(() => {
    const p = this.providers();
    return (Object.keys(p) as Array<'jira' | 'confluence' | 'sharepoint' | 'github' | 'gitlab'>)
      .filter(k => p[k]);
  });

  // Provider validations (extend as needed). Backend requires GitHub fields when GitHub is enabled.
  githubValid = computed(() => {
    // depend on formVersion so changes via ngModel recompute
    this.formVersion();
    if (!this.providers().github) return true; // not enabled -> valid
    const g = this.form.github || {};
    return !!(
      g.url?.trim() &&
      g.access_token?.trim() &&
      g.default_owner?.trim() &&
      g.default_repo?.trim() &&
      g.default_branch?.trim()
    );
  });

  // Helpful diagnostics: which fields are missing for GitHub
  githubMissing = computed(() => {
    this.formVersion();
    if (!this.providers().github) return [] as string[];
    const g = this.form.github || {};
    const missing: string[] = [];
    if (!g.url?.trim()) missing.push('url');
    if (!g.access_token?.trim()) missing.push('access_token');
    if (!g.default_owner?.trim()) missing.push('default_owner');
    if (!g.default_repo?.trim()) missing.push('default_repo');
    if (!g.default_branch?.trim()) missing.push('default_branch');
    return missing;
  });

  // Overall submit readiness
  canSubmit = computed(() => {
    // depend on form changes
    this.formVersion();
    // name must exist
    if (!this.form.name?.trim()) return false;
    // each enabled provider must be valid
    if (!this.githubValid()) return false;
    return true;
  });

  private buildPayload(): WorkspacePayload {
    const enabled = this.providers();
    const payload: WorkspacePayload = {
      name: this.form.name?.trim(),
      description: this.form.description?.trim() || undefined,
      // Use undefined to omit disabled providers from the JSON payload
      jira: enabled.jira ? this.form.jira : undefined,
      confluence: enabled.confluence ? this.form.confluence : undefined,
      sharepoint: enabled.sharepoint ? this.form.sharepoint : undefined,
      github: enabled.github ? this.form.github : undefined,
      gitlab: enabled.gitlab ? this.form.gitlab : undefined,
    };
    return payload;
  }

  async onSubmit() {
    if (!this.form.name?.trim()) return;
    if (!this.canSubmit()) {
      // Surface validation by focusing step 2 where credentials live
      this.step.set(2);
      return;
    }
    // If user is on earlier steps, guide them forward
    if (this.step() < 3) {
      this.step.set(3);
      return;
    }
    this.submitting.set(true);
    try {
      const payload = this.buildPayload();
      const created = await firstValueFrom(this.workspaces.createWorkspace(payload));
      console.log('Workspace created:', created);
      // Navigate back to workspaces after success
      this.router.navigate(['/workspaces']);
    } finally {
      this.submitting.set(false);
    }
  }
}
