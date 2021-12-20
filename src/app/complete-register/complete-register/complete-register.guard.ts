import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { DataService } from '@app/services/data.service';
import { UserInfoService } from '@app/services/user-info.service';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root'
})
export class CompleteRegisterGuard implements CanActivate {
  userInfo: any;

  constructor(private router: Router, private dataService: DataService, private userInfoService: UserInfoService) {}

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    this.userInfo = this.userInfoService.storedUserInfo;
    if (!this.userInfo) this.router.navigate(['/register'], { replaceUrl: true });
    else return !this.userInfo.profileComplete;
  }
}
