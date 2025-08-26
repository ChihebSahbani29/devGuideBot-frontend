export interface GithubInfo {
  url: string;
  access_token: string; // masked in UI
  default_owner: string;
  default_repo: string;
  default_branch: string;
}

export interface Workspace {
  id: string;
  name: string;
  description: string;
  jira: unknown | null;
  confluence: unknown | null;
  sharepoint: unknown | null;
  github: GithubInfo | null;
  gitlab: unknown | null;
}
