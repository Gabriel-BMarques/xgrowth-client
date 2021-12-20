import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate } from '@angular/router';
import { CredentialsService } from '@app/core';
import { DataService } from '@app/services/data.service';

@Injectable({
  providedIn: 'root'
})
export class EditWebinarGuard implements CanActivate {
  constructor(private dataService: DataService, private credentialsService: CredentialsService) {}

  async canActivate(route: ActivatedRouteSnapshot): Promise<boolean> {
    const webinarId: string = route.params.id;
    const [currentUser, webinar] = (
      await Promise.all([
        this.dataService.getUserProfile().toPromise(),
        this.dataService.find('/webinar', webinarId).toPromise()
      ])
    ).map(res => res.body);
    return currentUser.id === webinar.createdBy || this.credentialsService.checkRole === 'admin';
  }
}
