import { Route, Routes } from '@angular/router';
import { AuthenticationGuard } from '@app/core';
import { ShellComponent } from './shell.component';

/**
 * Provides helper methods to create routes.
 */
export class Shell {
  /**
   * Creates routes using the shell component and authentication.
   * @param routes The routes to add.
   * @return The new route using shell as the base.
   */
  static childRoutes(routes: Routes, childGuard?: any): Route {
    const response = {
      path: '',
      component: ShellComponent,
      canActivate: [AuthenticationGuard],
      children: routes,
      // Reuse ShellComponent instance when navigating between child views
      data: { reuse: true }
    };
    childGuard && Object.assign(response, { canActivateChild: childGuard });
    return response;
  }
}
