import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, CanDeactivate } from '@angular/router';
import { Observable } from 'rxjs';
import { NavigationService } from '@app/services/navigation.service';
import { IAlertControtllerGuard } from '@app/shared/i-alert-controtller-guard';

@Injectable({
  providedIn: 'root'
})
export class PostGuardsGuard implements CanDeactivate<IAlertControtllerGuard> {
  constructor(private navigationService: NavigationService) {}
  canDeactivate(
    component: IAlertControtllerGuard,
    _currentRoute: ActivatedRouteSnapshot,
    _currentState: RouterStateSnapshot,
    _nextState?: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    const current = _currentRoute.routeConfig.path.toString();
    const next = _nextState.url.toString();
    if (
      // botao next de post
      next.includes('post/add') ||
      // ultimo step de criacao de post
      (current.includes('add/preview') && next.includes('/organization')) ||
      // ultimo step editando post
      (current.includes('add/edit/preview') && next.includes('/organization')) ||
      // quando clica em edit e aperta cancel, volta para o respectivo post
      (current.includes('add/edit') && next.includes('/post/details'))
    ) {
      return true;
    } else {
      return component.canDeactivate();
    }
  }
}
