import { Routes, Route } from '@angular/router';
import { InterestsComponent } from './interests.component';
import { AuthenticationGuard } from '@app/core';
/**
 * Provides helper methods to create routes.
 */
export class Interests {
  /**
   * Creates routes using the shell component and authentication.
   * @param routes The routes to add.
   * @return The new route using shell as the base.
   */
  static childRoutes(routes: Routes): Route {
    return {
      path: '',
      component: InterestsComponent,
      children: routes,
      canActivate: [AuthenticationGuard],
      // Reuse ShellComponent instance when navigating between child views
      data: { reuse: true }
    };
  }
}
