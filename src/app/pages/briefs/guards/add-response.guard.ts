import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot } from '@angular/router';
import { DataService } from '@app/services/data.service';
import { UserInfoService } from '@app/services/user-info.service';
import { IBrief } from '@app/shared/models/brief.model';
import { IBriefSupplier } from '@app/shared/models/briefSupplier.model';
import { LoadingController, PopoverController } from '@ionic/angular';
import { BriefInactiveComponent } from '../brief-accept/brief-inactive/brief-inactive.component';
import { IncompleteOrganizationPopoverComponent } from '../brief-accept/incomplete-organization-popover/incomplete-organization-popover.component';

@Injectable({
  providedIn: 'root'
})
export class AddResponseGuard implements CanActivate {
  private _brief: IBrief;
  private _briefSupplier: IBriefSupplier;

  constructor(
    private dataService: DataService,
    private userInfoService: UserInfoService,
    private loadController: LoadingController,
    private popoverController: PopoverController
  ) {}

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    const loader = await this.loadController.create();
    await this.getData(route.params.id);
    const activateCondition =
      (this.briefIsPublic() || this.hasAcceptedNda() || this.acceptedBrief()) && this.isActive() && this.canRespond();

    if ((this.canRespond() && !this.isActive()) || (!this.canRespond() && !this.isActive())) {
      await this.briefInactivePopover();
      loader.dismiss();
      return activateCondition;
    } else if (!this.canRespond() && this.isActive()) {
      await this.incompleteOrgPopover();
      loader.dismiss();
      return activateCondition;
    } else {
      loader.dismiss();
      return activateCondition;
    }
  }

  private async incompleteOrgPopover() {
    const popover = await this.popoverController.create({
      component: IncompleteOrganizationPopoverComponent,
      componentProps: {
        organizationAdmin: this.userInfoService.storedUserInfo.role === 'organization-admin',
        organizationId: this.userInfoService.storedUserInfo.organization._id
      },
      cssClass: 'incomplete-organization-popover'
    });
    popover.present();
  }

  private async briefInactivePopover() {
    const popoverInactive = await this.popoverController.create({
      component: BriefInactiveComponent,
      cssClass: 'brief-inactive-popover'
    });
    popoverInactive.present();
  }

  private async getData(briefId: string) {
    await Promise.all([
      this.dataService
        .find('/brief', briefId)
        .toPromise()
        .then(brief => {
          this._brief = brief.body;
        }),
      this.dataService
        .list('/brief-supplier', { BriefId: briefId, SupplierId: this.userInfoService.storedUserInfo.company._id })
        .toPromise()
        .then(briefSuppliers => {
          this._briefSupplier = briefSuppliers.body[0];
        })
    ]);
  }

  private briefIsPublic() {
    if (this._brief && this._brief.NdaRequirementMode === 2) {
      return true;
    }
    return false;
  }

  private hasAcceptedNda() {
    if (this._briefSupplier && this._briefSupplier.NdaAcceptance === 1) {
      return true;
    }
    return false;
  }

  private acceptedBrief() {
    if (this._briefSupplier && this._briefSupplier.Accepted === true) {
      return true;
    }
    return false;
  }

  private isActive() {
    return this._brief.isActive;
  }

  private canRespond() {
    return this.userInfoService.storedUserInfo.canRespondBrief;
  }
}
