import { Routes } from '@angular/router';
import { WorkspacesComponent } from './workspaces.component';
import { ConversationsComponent } from '../conversations/conversations.component';
import { CreateWorkspaceComponent } from './components/create-workspace/create-workspace.component';

export const WORKSPACES_ROUTES: Routes = [
  // /workspaces
  { path: '', component: WorkspacesComponent },

  // /workspaces/new
  { path: 'new', component: CreateWorkspaceComponent },

  // /workspaces/:id -> redirect to conversations
  { path: ':id', pathMatch: 'full', redirectTo: ':id/conversations' },

  // /workspaces/:id/conversations
  { path: ':id/conversations', component: ConversationsComponent },

  // /workspaces/:id/conversations/:cid
  { path: ':id/conversations/:cid', component: ConversationsComponent },
];