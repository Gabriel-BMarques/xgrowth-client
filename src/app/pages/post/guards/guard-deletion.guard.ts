import { Injectable } from '@angular/core';
import {
  CanDeactivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  Router,
  ActivatedRoute
} from '@angular/router';
import { DataService } from '@app/services/data.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GuardDeletionGuard implements CanDeactivate<unknown> {
  constructor(private dataService: DataService) {}
  async canDeactivate(
    component: unknown,
    currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot,
    nextState?: RouterStateSnapshot
  ): Promise<boolean> {
    const postId = nextState.url.split('/post/details/')[1];

    if (postId) {
      const deleted = await this.isDeleted(postId);
      return deleted;
    } else {
      return true;
    }
  }

  private async isDeleted(postId: string): Promise<boolean> {
    let status: boolean = true;
    await this.dataService
      .find('/post', postId)
      .toPromise()
      .then(post => {
        console.log(post.body);
        return (status = true);
      })
      .catch(async error => {
        await this.dataService
          .find('/brief', postId)
          .toPromise()
          .then(post => {
            if (post.body) {
              console.log(post.body);
              return (status = true);
            } else {
              return (status = false);
            }
          });
        console.log(error);
        return status;
      });
    console.log(status);
    return status;
  }
}
