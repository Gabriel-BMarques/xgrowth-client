import { Injectable } from '@angular/core';
import { CanDeactivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { DataService } from '@app/services/data.service';
import { InterestsCompletePopoverComponent } from '@app/shared/popovers/interests-complete-popover/interests-complete-popover.component';
import { PopoverController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class InterestsGuard implements CanDeactivate<unknown> {
  user: any;
  userId: any;
  userInterests: any[];
  interestsCounted: Number = 0;
  interestsStepCompleted: Boolean;

  constructor(private dataService: DataService, private popoverController: PopoverController) {}
  async canDeactivate(
    component: unknown,
    currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot,
    nextState?: RouterStateSnapshot
  ): Promise<any> {
    this.interestsCounted = await this.getUserInfo();

    if (this.interestsCounted > 0 || !(this.interestsStepCompleted === false)) {
      this.user.interestsStepCompleted = true;

      if (!this.interestsStepCompleted) await this.dataService.updateUser('/users', this.user).toPromise();

      return true;
    }

    this.showIncompleteStepPopover();
    return false;
  }

  async showIncompleteStepPopover(): Promise<void> {
    (
      await this.popoverController.create({
        component: InterestsCompletePopoverComponent
      })
    ).present();
  }

  async getUserInfo() {
    await this.dataService
      .getUserInfo()
      .toPromise()
      .then(async user => {
        this.user = user.body;
        this.userId = user.body.id;
        this.interestsStepCompleted = user.body.interestsStepCompleted;
        this.interestsCounted = await this.getIntersts();
      });

    return this.interestsCounted;
  }

  async getIntersts() {
    await this.dataService
      .list('/interests', { userId: this.userId })
      .toPromise()
      .then(interests => {
        this.userInterests = interests.body;
      });

    return this.userInterests.length;
  }
}
