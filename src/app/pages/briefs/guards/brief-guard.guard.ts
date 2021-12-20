import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanDeactivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { NavigationService } from '@app/services/navigation.service';
import { IAlertControtllerGuard } from '@app/shared/i-alert-controtller-guard';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BriefGuardGuard implements CanDeactivate<IAlertControtllerGuard> {
  constructor(private navigationService: NavigationService) {}
  canDeactivate(
    component: IAlertControtllerGuard,
    _currentRoute: ActivatedRouteSnapshot,
    _currentState: RouterStateSnapshot,
    _nextState?: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    const next = _nextState.url.toString();
    const current = _currentRoute.routeConfig.path.toString();
    if (
      (current.includes('add-') && next.includes('briefs/add-')) ||
      (current.includes('add-') && next.includes('briefs/my-brief')) ||
      (current.includes('add-response') && next.includes('/post/details')) ||
      (current.includes('add-response/preview') && next.includes('briefs')) ||
      (current.includes('add-response') && next.includes('briefs/accept'))
    ) {
      return true;
    } else {
      return component.canDeactivate();
    }
  }
}
