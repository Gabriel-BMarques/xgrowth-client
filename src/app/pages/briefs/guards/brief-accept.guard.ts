import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot } from '@angular/router';
import { DataService } from '@app/services/data.service';
import { UserInfoService } from '@app/services/user-info.service';
import { IBrief } from '@app/shared/models/brief.model';
import { IBriefSupplier } from '@app/shared/models/briefSupplier.model';
@Injectable({
  providedIn: 'root'
})
export class BriefAcceptGuard implements CanActivate {
  private _brief: IBrief;
  private _briefSupplier: IBriefSupplier;

  constructor(private dataService: DataService, private userInfoService: UserInfoService) {}

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    await this.getData(route.params.id);
    const activateCondition = this.briefIsPublic() || this.hasAcceptedNda();

    return activateCondition;
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
}
