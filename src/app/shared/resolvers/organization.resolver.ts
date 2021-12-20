import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { DataService } from '@app/services/data.service';
import { Observable } from 'rxjs';
import { pluck } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class OrganizationResolver implements Resolve<any> {
  constructor(private dataService: DataService) {}
  resolve(route: ActivatedRouteSnapshot): Observable<string> {
    const organizationId = route.paramMap.get('id');
    return this.dataService.find('/organization', organizationId).pipe(pluck('body'));
  }
}
