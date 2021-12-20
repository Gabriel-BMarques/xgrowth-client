import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { extract } from '@app/core';
import { PostComponent } from './post.component';
import { PostAddComponent } from './add/post-add.component';
import { PostPreviewComponent } from './add/preview/preview.component';
import { PostCategoriesComponent } from './add/post-categories/post-categories.component';
import { AddCategoriesComponent } from './add/add-categories/add-categories.component';
import { TermsAndConditionsComponent } from './add/terms-and-conditions/terms-and-conditions.component';
import { ShareComponent } from '@app/pages/post/share/share.component';
import { PostGuardsGuard } from './guards/post-guards.guard';

const routes: Routes = [
  {
    path: 'details/:id',
    component: PostComponent,
    data: { title: extract('Post') }
  },
  {
    path: 'share/:id',
    component: ShareComponent,
    data: { title: extract('Share') }
  },
  {
    path: 'add',
    component: PostAddComponent,
    data: { title: extract('Create New Post') },
    canDeactivate: [PostGuardsGuard]
  },
  {
    path: 'add/edit/:id',
    component: PostAddComponent,
    data: { title: extract('Edit Post') },
    canDeactivate: [PostGuardsGuard]
  },
  {
    path: 'add/preview',
    component: PostPreviewComponent,
    data: { title: extract('Post Preview') },
    canDeactivate: [PostGuardsGuard]
  },
  {
    path: 'add/edit/preview/:id',
    component: PostPreviewComponent,
    data: { title: extract('Post Preview') },
    canDeactivate: [PostGuardsGuard]
  },
  {
    path: 'add/categories',
    component: PostCategoriesComponent,
    data: { title: extract('Categories') }
  },
  {
    path: 'add/edit/categories/:id',
    component: PostCategoriesComponent,
    data: { title: extract('Categories') }
  },
  {
    path: 'add/add-categories',
    component: AddCategoriesComponent,
    data: { title: extract('Select Categories') },
    canDeactivate: [PostGuardsGuard]
  },
  {
    path: 'add/edit/add-categories/:id',
    component: AddCategoriesComponent,
    data: { title: extract('Select Categories') },
    canDeactivate: [PostGuardsGuard]
  },
  {
    path: 'add/terms-and-conditions',
    component: TermsAndConditionsComponent,
    data: { title: extract('Terms And Conditions') },
    canDeactivate: [PostGuardsGuard]
  },
  {
    path: 'add/edit/terms-and-conditions/:id',
    component: TermsAndConditionsComponent,
    data: { title: extract('Terms And Conditions') },
    canDeactivate: [PostGuardsGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PostRoutingModule {}
