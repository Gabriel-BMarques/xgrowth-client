import { TutorialModule } from './pages/tutorial/tutorial.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { Shell } from './shell/shell.service';
import { AuthenticationGuard } from './core';
import { ShellComponent } from './shell/shell.component';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  {
    path: 'login',
    loadChildren: () => import('./login/login.module').then(m => m.LoginModule)
  },
  {
    path: 'complete-register',
    loadChildren: () =>
      import('./complete-register/complete-register/complete-register.module').then(m => m.CompleteRegisterModule)
  },
  {
    path: 'new-password',
    loadChildren: () => import('./new-password/new-password.module').then(m => m.NewPasswordModule)
  },
  {
    path: 'reactivate',
    loadChildren: () => import('./reactivate/reactivate.module').then(m => m.ReactivateModule)
  },
  {
    path: 'register',
    loadChildren: () => import('./register/register.module').then(m => m.RegisterModule)
  },
  Shell.childRoutes([
    {
      path: 'admin',
      loadChildren: () => import('./pages/admin/admin.module').then(m => m.AdminModule)
    },
    {
      path: 'tutorial',
      loadChildren: () => import('./pages/tutorial/tutorial.module').then(m => m.TutorialModule)
    },
    {
      path: 'organization',
      loadChildren: () => import('./pages/organization/organization.module').then(m => m.OrganizationModule)
    },
    {
      path: 'complete-registration',
      loadChildren: () =>
        import('./pages/complete-registration/complete-registration.module').then(m => m.CompleteRegistrationModule)
    },
    {
      path: 'post',
      loadChildren: () => import('./pages/post/post.module').then(m => m.PostModule)
    },
    {
      path: 'briefs',
      loadChildren: () => import('./pages/briefs/briefs.module').then(m => m.BriefsModule)
    },
    {
      path: 'webinars',
      loadChildren: () => import('./pages/webinars/webinars.module').then(m => m.WebinarsModule)
    },
    {
      path: 'solvers',
      loadChildren: () => import('./pages/view-solvers/view-solvers.module').then(m => m.ViewSolversModule)
    },
    {
      path: 'home',
      loadChildren: () => import('./pages/home/home.module').then(m => m.HomeModule)
    },
    {
      path: 'collections',
      loadChildren: () => import('./pages/collections/collections.module').then(m => m.CollectionsModule)
    },
    {
      path: 'interests',
      loadChildren: () => import('./pages/interests/interests.module').then(m => m.InterestsModule)
    }
  ])
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forRoot(routes, {
      preloadingStrategy: PreloadAllModules
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
