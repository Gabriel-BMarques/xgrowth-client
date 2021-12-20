// import { NgModule } from '@angular/core';
// import { RouterModule, Routes } from '@angular/router';
// import { TabsComponent } from './tabs.component';

// const routes: Routes = [
//     {
//         path: 'tabs',
//         component: TabsComponent,
//         children: [
//             {
//                 path: 'home',
//                 outlet: 'one',
//                 loadChildren: '../app/pages/home/home.module#HomeModule'
//             },
//             {
//                 path: 'briefs',
//                 outlet: 'two',
//                 loadChildren: '../app/pages/briefs/briefs.module#BriefsModule'
//             },
//             {
//                 path: 'interests',
//                 outlet: 'three',
//                 loadChildren: '../app/pages/interests/interests.module#InterestsModule'
//             }
//         ]
//     },
//     {
//         path: '',
//         redirectTo: '/tabs/home'
//     }
// ];

// @NgModule({
//   imports: [RouterModule.forChild(routes)],
//   exports: [RouterModule]
// })
// export class TabsRoutingModule { }
