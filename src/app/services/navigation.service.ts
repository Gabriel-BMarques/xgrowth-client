import { Injectable } from '@angular/core';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';
import { BriefAddWizardService } from '@app/services/brief-add-wizard.service';
import { ResponseAddWizardService } from '@app/services/response-add-wizard.service';
import { PostAddWizardService } from '@app/services/post-add-wizard.service';
import { IBriefSupplier } from '@app/shared/models/briefSupplier.model';
import { IBrief } from '@app/shared/models/brief.model';
import { DataService } from './data.service';
import { IPost, Post } from '@app/shared/models/post.model';
import { IResponse, Response } from '@app/shared/models/response.model';
import { HeaderService } from './header.service';
import { filter } from 'rxjs/operators';
import { AlertController, PopoverController } from '@ionic/angular';
import { PopoverCancelComponent } from '@app/shared/popovers/popover-cancel/popover-cancel.component';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  post: IPost = new Post();
  response: IResponse = new Response();
  currentRoute: string;
  previousRoute: string;
  previousPostRoute: string;
  previousBriefRoute: string;
  companyProfileSelectedTabIndex: number = 0;
  currentUrl: string;
  previousUrl: string;

  nextPostRoute: any;
  private _brief: IBrief;
  private _briefSupplier: IBriefSupplier;

  constructor(
    private briefWizard: BriefAddWizardService,
    private responseWizard: ResponseAddWizardService,
    private postWizard: PostAddWizardService,
    private dataService: DataService,
    private router: Router,
    private headerService: HeaderService,
    private popoverController: PopoverController,
    private alertController: AlertController
  ) {}

  listenRouteEvents() {
    this.router.events.pipe(filter(event => event instanceof NavigationStart)).subscribe((event: NavigationStart) => {
      this.headerService.refreshHeader(event.url);
      this.nextPostRoute = event.url;
    });
  }

  public getRoute(currentPath: string) {
    currentPath = currentPath.substring(1);
    if (this.currentRoute) {
      this.previousRoute = this.currentRoute;
    }
    this.currentRoute = currentPath;
  }

  public getPostRoutes(currentPath: string) {
    currentPath = currentPath.substring(1);
    const backPostRoute = ['company', 'home', 'my-brief', 'brief-accept'];

    const matchRoute = backPostRoute.some(route => {
      return currentPath.includes(route);
    });

    if (matchRoute) {
      this.previousPostRoute = currentPath;
    }
    if (!matchRoute) {
      this.previousPostRoute;
    }
  }

  public getBriefRouter(currentPath: string) {
    currentPath = currentPath.substring(1);
    const matchRoute = currentPath.includes('company') || currentPath === '/briefs' ? true : false;
    if (matchRoute) {
      this.previousBriefRoute = currentPath;
    } else {
      this.previousBriefRoute;
    }
  }

  public async cancelButton(currentPath: string) {
    const briefPath = '#/briefs/add-brief';
    const postPath = '#/post/add';
    const responsePath = '#/briefs/add-response';
    if (currentPath.includes(briefPath) || currentPath.includes(postPath) || currentPath.includes(responsePath)) {
      //abrir popover
      const popover = await this.popoverController.create({
        component: PopoverCancelComponent,
        cssClass: 'popover-cancel'
        //  componentProps: {
        //    complete: true
        //  }
      });
      popover.present();
    }
  }

  public clearWizardData(currentPath: string) {
    // const briefPath = '/briefs/add-brief';
    // const postPath = '/post/add';
    // const responsePath = '/briefs/add-response';
    // if (currentPath.includes(briefPath)) {
    //   this.briefWizard.reset();
    //   this.response = this.briefWizard.entityCopy;
    //   if (this.response._id) {
    //     this.dataService
    //       .update('/brief', this.response)
    //       .toPromise()
    //       .then(() => {});
    //   }
    // }
    // if (currentPath.includes(postPath)) {
    //   this.postWizard.reset();
    //   this.post = this.postWizard.entityCopy;
    //   if (this.post._id) {
    //     this.dataService
    //       .update('/post', this.post)
    //       .toPromise()
    //       .then(() => {});
    //   }
    // }
    // if (currentPath.includes(responsePath)) {
    //   this.responseWizard.reset();
    //   this.post = this.responseWizard.entityCopy;
    //   if (this.post._id) {
    //     this.dataService
    //       .update('/post', this.post)
    //       .toPromise()
    //       .then(() => {});
    //   }
    // }
    console.log(currentPath);
  }

  // ALERT POST
  generateAlert(header: string, message: string, ok: string, notOk: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      // alertController.create(...) returns a boolean promise!
      this.alertController
        .create({
          header: header,
          cssClass: 'alertConfirmation',
          message: message,
          buttons: [
            {
              text: ok,
              cssClass: 'confirmation-discardButton',
              handler: () => {
                this.post = this.postWizard.entityCopy;
                this.postWizard.reset();
                if (this.post._id) {
                  this.dataService
                    .update('/post', this.post)
                    .toPromise()
                    .then(() => {
                      resolve(true);
                    });
                }
                resolve(true);
              }
            },
            {
              text: notOk,
              cssClass: 'confirmation-cancelButton',
              role: 'cancel'
            }
          ]
        })
        .then(alert => {
          alert.present();
        });
    });
  }
  //ALERT BRIEF
  generateAlertBrief(header: string, message: string, ok: string, notOk: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      // alertController.create(...) returns a boolean promise!
      this.alertController
        .create({
          cssClass: 'alertConfirmation',
          header: header,
          message: message,
          buttons: [
            {
              text: ok,
              cssClass: 'confirmation-discardButton',
              handler: () => {
                this.response = this.briefWizard.entityCopy;
                this.briefWizard.reset();
                if (this.response._id !== undefined) {
                  this.dataService
                    .update('/brief', this.response)
                    .toPromise()
                    .then(() => {});
                  resolve(true);
                }
                resolve(true);
              }
            },
            {
              text: notOk,
              cssClass: 'confirmation-cancelButton',
              role: 'cancel'
            }
          ]
        })
        .then(alert => {
          alert.present();
        });
    });
  }
  // ALERT BRIEF RESPONSE
  generateAlertBriefResponse(header: string, message: string, ok: string, notOk: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      // alertController.create(...) returns a boolean promise!
      this.alertController
        .create({
          header: header,
          cssClass: 'alertConfirmation',
          message: message,
          buttons: [
            {
              text: ok,
              cssClass: 'confirmation-discardButton',
              handler: () => {
                this.post = this.responseWizard.entityCopy;
                this.responseWizard.reset();
                if (this.post._id) {
                  this.dataService
                    .update('/post', this.post)
                    .toPromise()
                    .then(() => {
                      resolve(true);
                    });
                }
                resolve(true);
              }
            },
            {
              text: notOk,
              cssClass: 'confirmation-cancelButton',
              role: 'cancel'
            }
          ]
        })
        .then(alert => {
          alert.present();
        });
    });
  }

  public changeTabBarDisplay(currentPath: string) {
    const briefPath = '#/briefs/add-brief';
    const postPath = '#/post/add';
    const responsePath = '#/briefs/add-response';
    const postDetailsPath = '#/post/details';
    let tabBar: boolean;

    if (currentPath.includes(briefPath)) {
      tabBar = false;
      return tabBar;
    }
    if (currentPath.includes(postPath)) {
      tabBar = false;
      return tabBar;
    }
    if (currentPath.includes(responsePath)) {
      tabBar = false;
      return tabBar;
    }
    if (currentPath.includes(postDetailsPath)) {
      tabBar = false;
      return tabBar;
    }

    tabBar = true;
    return tabBar;
  }

  public get brief() {
    return this._brief;
  }

  public set brief(entity: any) {
    this._brief = entity;
  }

  public get briefSupplier() {
    return this._briefSupplier;
  }

  public set briefSupplier(entity: any) {
    this._briefSupplier = entity;
  }
}
