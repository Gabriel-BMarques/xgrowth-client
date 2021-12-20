import { Injectable } from '@angular/core';
import { DataService } from '@app/services/data.service';
import { IInterest } from '@app/shared/models/interests.model';
@Injectable({
  providedIn: 'root'
})
export class LoadInterestsService {
  userInterests: IInterest[] = [];
  arrayCategories: any[] = [];
  arraySubCategories: any[] = [];

  hasLoadedInterests: boolean = false;
  hasLoadedCategories: boolean = false;

  constructor(private dataService: DataService) {}

  async refreshData(userRole: string) {
    if (userRole === 'admin') {
      await this.dataService
        .listAll('/category')
        .toPromise()
        .then(res => {
          this.arrayCategories = res.body.filter(category => {
            return category.parentId === null;
          });
          this.arraySubCategories = res.body.filter(subcategory => {
            return subcategory.parentId !== null;
          });
        });
    } else {
      await this.dataService
        .list('/category/interests')
        .toPromise()
        .then(res => {
          this.arrayCategories = res.body.filter(category => {
            return category.parentId === null;
          });
          this.arraySubCategories = res.body.filter(subcategory => {
            return subcategory.parentId !== null;
          });
        });
    }
    this.hasLoadedCategories = true;
  }
}
