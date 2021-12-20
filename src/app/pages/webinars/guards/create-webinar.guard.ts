import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { CredentialsService } from '@app/core';
import { DataService } from '@app/services/data.service';

@Injectable({
  providedIn: 'root'
})
export class CreateWebinarGuard implements CanActivate {
  constructor(private dataService: DataService, private credentialsService: CredentialsService) {}

  async canActivate(): Promise<boolean> {
    const currentCompany = (await this.dataService.getUserCompany().toPromise()).body;
    return !!currentCompany.hasWebinarAccess || this.credentialsService.checkRole === 'admin';
  }
}
