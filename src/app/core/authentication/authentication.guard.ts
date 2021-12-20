import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { DataService } from '@app/services/data.service';
import { environment } from '@env/environment';

import { Logger } from '../logger.service';
import { CredentialsService } from './credentials.service';

const log = new Logger('AuthenticationGuard');

@Injectable({
  providedIn: 'root'
})
export class AuthenticationGuard implements CanActivate {
  user: any;
  userProfileComplete: any;

  constructor(
    private router: Router,
    private credentialsService: CredentialsService,
    private dataService: DataService
  ) {}

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    if (this.credentialsService.isAuthenticated()) {
      const userProfileComplete = await this.getUser();

      if (!userProfileComplete) {
        this.router.navigate(['/complete-register'], { replaceUrl: true }).then(() => {
          window.location.reload();
        });

        return false;
      }
      return true;
    }

    log.debug('Not authenticated, redirecting and adding redirect url...');
    this.router.navigate(['/login'], { queryParams: { redirect: state.url }, replaceUrl: true });

    return false;
  }

  private async getUser(): Promise<boolean> {
    await this.dataService
      .getUserInfo()
      .toPromise()
      .then(user => {
        this.userProfileComplete = user.body.profileComplete;
      });

    return this.userProfileComplete;
  }
}
