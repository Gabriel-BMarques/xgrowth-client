import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, Router } from '@angular/router';
import { UserInfoService } from '@app/services/user-info.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate, CanActivateChild {
  constructor(private router: Router, private userInfoService: UserInfoService) {}

  canActivate(): Observable<boolean> | boolean {
    const isAdmin = this.userInfoService.storedUserInfo.role === 'admin';
    !isAdmin && this.router.navigateByUrl('/home', { replaceUrl: true });
    return isAdmin;
  }

  canActivateChild(): Observable<boolean> | boolean {
    return this.canActivate();
  }
}
