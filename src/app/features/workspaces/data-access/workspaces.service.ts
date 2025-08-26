import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export type ProviderGithub = {
  url: string;
  access_token: string;
  default_owner: string;
  default_repo: string;
  default_branch: string;
};

export type ProviderJira = {
  url: string;
  email: string;
  api_token: string;
  project_key: string;
};

export type ProviderConfluence = {
  url: string;
  email: string;
  api_token: string;
  space_key: string;
};

export type ProviderSharePoint = {
  site_url: string;
  client_id: string;
  client_secret: string;
  tenant_id: string;
};

export type ProviderGitLab = {
  url: string;
  access_token: string;
  default_owner: string;
  default_repo: string;
  default_branch: string;
};

export type WorkspacePayload = {
  name: string;
  description?: string;
  jira?: ProviderJira | null;
  confluence?: ProviderConfluence | null;
  sharepoint?: ProviderSharePoint | null;
  github?: ProviderGithub | null;
  gitlab?: ProviderGitLab | null;
};

export type WorkspaceResponse = WorkspacePayload & {
  id: string;
};

export type WorkspacesListResponse = {
  workspaces: WorkspaceResponse[];
};

@Injectable({ providedIn: 'root' })
export class WorkspacesService {
  private readonly http = inject(HttpClient);
  // If you set up a proxy, you can change this to '/api'.
  private readonly baseUrl = 'http://localhost:8000';

  createWorkspace(payload: WorkspacePayload): Observable<WorkspaceResponse> {
    return this.http.post<WorkspaceResponse>(`${this.baseUrl}/workspaces/`, payload);
  }

  getWorkspaces(): Observable<WorkspaceResponse[]> {
    return this.http
      .get<WorkspacesListResponse>(`${this.baseUrl}/workspaces/`)
      .pipe(map((r) => r.workspaces));
  }
}