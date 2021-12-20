import { Injectable } from '@angular/core';
import { IUser } from '@app/shared/models/user.model';
import { DataService } from './data.service';

const storage = localStorage;

@Injectable({
  providedIn: 'root'
})
export class UserInfoService {
  private _userInfo: IUser;

  get userInfo(): IUser {
    return this._userInfo;
  }

  set userInfo(value: IUser) {
    this._userInfo = value;
  }

  get storedUserInfo() {
    const user = storage.getItem('userInfo');
    return JSON.parse(user);
  }

  constructor(private dataService: DataService) {}

  async setUserInfo() {
    await this.dataService
      .getUserProfile()
      .toPromise()
      .then(res => {
        this.userInfo = res.body;
        storage.removeItem('userInfo');
        storage.setItem('userInfo', JSON.stringify(this.userInfo));
      })
      .catch(err => console.log(err));
  }

  async refreshUserInfo() {
    await this.setUserInfo();
  }
}
