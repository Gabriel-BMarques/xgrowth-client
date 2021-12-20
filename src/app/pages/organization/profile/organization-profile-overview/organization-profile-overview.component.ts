import { ViewMoreModalComponent } from '../../../../shared/modals/view-more-modal/view-more-modal.component';
import { ICountry } from '../../../../shared/models/country.model';
import { Component, OnInit, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from '@app/services/data.service';
import { IBrief } from '@app/shared/models/brief.model';
import { ICertification } from '@app/shared/models/certifications.model';
import { IInitiative } from '@app/shared/models/initiative.model';
import { IOrganization } from '@app/shared/models/organizations.model';
import { IPost } from '@app/shared/models/post.model';
import { IProduct } from '@app/shared/models/product.model';
import { ISegment } from '@app/shared/models/segment.model';
import { ISkill } from '@app/shared/models/skill.model';
import { IUploadedFile } from '@app/shared/models/uploadedFile.model';
import { IUser } from '@app/shared/models/user.model';
import { IWebinar } from '@app/shared/models/webinar.model';
import { ModalController } from '@ionic/angular';
import { flattenDeep, uniqBy } from 'lodash';
import { BehaviorSubject, concat, Observable, pipe } from 'rxjs';
import { concatMap, map, pluck, tap } from 'rxjs/operators';
import { OverviewModalComponent } from './overview-modal/overview-modal.component';
import { ManufacturingDetailsModalComponent } from './manufacturing-details-modal/manufacturing-details-modal.component';
import { MediaService } from '@app/services/media.service';
import { isNil } from 'lodash';
import { ProductCardComponent } from '../organization-products/product-list/product-card/product-card.component';
import { UserInfoService } from '@app/services/user-info.service';

// Extract images from post, briefs and briefResponses
const extractImages = pipe(
  map((entity: IPost[] | IBrief[] | any) => entity.filter((entity: any) => entity.UploadedFiles.length)),
  map((entity: IPost[] | IBrief[] | any) => entity.map((post: any) => post.UploadedFiles)),
  map(uploadedFiles => flattenDeep(uploadedFiles)),
  map(uploadesFiles => uploadesFiles.filter((f: IUploadedFile) => f.Type === 'png' || f.Type === 'jpeg'))
);
@Component({
  selector: 'app-organization-profile-overview',
  templateUrl: './organization-profile-overview.component.html',
  styleUrls: ['./organization-profile-overview.component.scss']
})
export class OrganizationProfileOverviewComponent implements OnInit {
  organization: IOrganization | any;
  skills: string;
  segments: string;
  subSegments: string;
  certifications: string;
  initiatives: string;

  viewport: string;
  isEditing = false;
  hasWebinarTruncatedDescription: boolean = true;
  readMoreWebinarDescription: boolean = false;

  imagePlaceholder = '../../../../../assets/default-fallback-image.svg';

  organizationPosts$: Observable<any[]>;
  organizationBriefs$: Observable<any[]>;
  briefResponses$: Observable<any[]>;
  webinarsObs$: Observable<any[]>;
  productsObs$: Observable<any[]>;
  productsByCityObs$: Observable<any[]>;

  loadData$: Observable<any>;

  private _organizationPostsSubject$ = new BehaviorSubject<IPost[]>([]);
  private _organizationBriefsSubject$ = new BehaviorSubject<IBrief[]>([]);
  private _briefResponsesSubject$ = new BehaviorSubject<IPost[]>([]);
  private _webinarsSubject$ = new BehaviorSubject<IWebinar>(null);
  private _userSubject$ = new BehaviorSubject<IUser>(null);
  private _productsSubject$ = new BehaviorSubject<IProduct[]>([]);
  private _productsByCitySubject$ = new BehaviorSubject<any[]>([]);

  organizationPostsImages$ = this._organizationPostsSubject$.asObservable().pipe(extractImages);
  organizationBriefsImages$ = this._organizationBriefsSubject$.asObservable().pipe(extractImages);
  briefResponsesImages$ = this._briefResponsesSubject$.asObservable().pipe(extractImages);
  currentUser$ = this._userSubject$.asObservable();
  webinars$ = this._webinarsSubject$.asObservable();
  products$ = this._productsSubject$.asObservable();
  productsByCity$ = this._productsByCitySubject$.asObservable();

  perPage = 10;
  page = 1;
  chartWidth: number = undefined;

  loadTabs: boolean = false;
  tab: string;

  get orgAnnualSalesAsNumber() {
    // removes everything that is not a digit from annual sales field
    const sales = this.organization?.annualSales.replace(/[^0-9\.]+/g, '');
    return Number(sales);
  }

  get isExternalManufacturer() {
    return this.organization.organizationType?.name === 'External Manufacturer';
  }

  get userInfo(): any {
    return this.userInfoService.storedUserInfo;
  }

  get canEdit(): boolean {
    return this.userInfoService.storedUserInfo.organization._id === this.organization._id;
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dataService: DataService,
    private modalController: ModalController,
    private mediaService: MediaService,
    private userInfoService: UserInfoService
  ) {}

  ngOnInit(): void {}

  ionViewWillLeave() {
    this.loadTabs = false;
  }

  ionViewWillEnter() {
    const { data } = this.route.snapshot.data;
    this.organization = data;

    this.skills = this.organization.skills.map((skill: ISkill) => skill.name).join(', ');
    this.segments = this.organization.segments.map((segment: ISegment) => segment.name).join(', ');
    this.subSegments = this.organization.subSegments.map((subSegment: ISegment) => subSegment.name).join(', ');
    this.certifications = this.organization.certifications
      .map((certification: ICertification) => certification.name)
      .join(', ');
    this.initiatives = this.organization.initiatives.map((initiative: IInitiative) => initiative.name).join(', ');

    this.setInitialViewport(window.innerWidth);

    this.loadData$ = this.loadData();
  }

  getWebinarThumbnail(webinar: IWebinar): string {
    let videoTypes = this.mediaService.videoFormats;
    return webinar?.uploadedFiles?.filter(uf => !videoTypes.includes(uf.Type))[0].url;
  }

  isNull(data: any) {
    return isNil(data);
  }

  goToWebinarsPage(): void {
    this.router.navigate(['/webinars'], {
      replaceUrl: true,
      queryParams: { organization: this.organization._id, tab: 'invitations' }
    });
  }

  webinarDescriptionReadMore(): void {
    this.hasWebinarTruncatedDescription = false;
    this.readMoreWebinarDescription = !this.hasWebinarTruncatedDescription;
  }

  webinarDescriptionReadLess(): void {
    this.hasWebinarTruncatedDescription = true;
    this.readMoreWebinarDescription = !this.hasWebinarTruncatedDescription;
  }

  viewOrgProducts() {
    this.router.navigate(['organization', this.organization._id, 'products']);
  }

  goToOrganizationContent(tab: string) {
    this.router.navigate([`organization/${this.organization._id}/content`], {
      replaceUrl: true,
      queryParams: { initialTab: tab }
    });
  }

  async overviewSeeAll() {
    const componentProps = {
      organizationType: this.organization.organizationType.name,
      segments: this.segments,
      subSegments: this.subSegments,
      skills: this.skills,
      certifications: this.certifications,
      initiatives: this.initiatives
    };
    const modal = await this.modalController.create({
      component: OverviewModalComponent,
      cssClass: 'overview-modal-popover',
      componentProps
    });
    await modal.present();
    await modal.onWillDismiss();
  }

  async manufacturingDetailsModal() {
    let modal = await this.modalController.create({
      component: ManufacturingDetailsModalComponent,
      cssClass: 'manufacturing-details-modal',
      componentProps: {
        organizationId: this.organization._id
      }
    });
    await modal.present();
  }

  async openProductModal(product: IProduct): Promise<void> {
    let modal = await this.modalController.create({
      component: ProductCardComponent,
      cssClass: 'product-card-modal',
      componentProps: {
        product,
        viewport: this.viewport,
        organization: this.organization,
        canEdit: false
      }
    });
    modal.present();
  }

  async handler(res: boolean) {
    this.hasWebinarTruncatedDescription = res;
  }

  async switchToList(organizationReach: ICountry[], event?: any) {
    (
      await this.modalController.create({
        component: ViewMoreModalComponent,
        cssClass: 'view-more-modal',
        componentProps: {
          items: organizationReach,
          type: 'organizationReach',
          modalTitle: 'Organization Reach'
        }
      })
    ).present();
  }

  private loadData() {
    this.webinarsObs$ = this.dataService
      .list('/webinar-invitation/logged', {
        'webinarId.createdBy.company.organization._id': this.organization?._id,
        'webinarId.eventDate': `{ "$gte": "${new Date().toISOString()}" }`
      })
      .pipe(
        pluck('body'),
        map((webinars: any[]) => webinars[0]?.webinarId),
        tap(webinar => this._webinarsSubject$.next(webinar))
      );

    if (this.userInfo.role === 'admin') {
      this.organizationPosts$ = this.dataService
        .list(`/post/organization`, { organizationId: this.organization._id })
        .pipe(
          pluck('body'),
          tap((posts: IPost[]) => this._organizationPostsSubject$.next(posts))
        );
    } else {
      this.organizationPosts$ = this.dataService.list(`/post/feed`, { organization: this.organization._id }).pipe(
        pluck('body'),
        tap((posts: IPost[]) => this._organizationPostsSubject$.next(posts))
      );
    }

    const briefQuery = {
      sentOrReceived: this.canEdit ? 'sent' : 'participating',
      organization: this.organization._id
    };
    if (this.userInfo.role === 'admin') delete briefQuery.sentOrReceived;

    console.log(briefQuery);

    this.organizationBriefs$ = this.dataService.list('/brief/main-page', briefQuery).pipe(
      pluck('body'),
      tap(briefs => this._organizationBriefsSubject$.next(briefs))
    );

    this.briefResponses$ = this.dataService.list(`/post/brief-responses/by-organization/${this.organization._id}`).pipe(
      pluck('body'),
      tap(briefResponses => this._briefResponsesSubject$.next(briefResponses))
    );

    this.productsObs$ = this.dataService
      .list(`/product?perPage=${this.perPage}&page=${this.page}`, { organization: this.organization._id })
      .pipe(
        pluck('body'),
        tap(products => this._productsSubject$.next(products))
      );

    this.productsByCity$ = this.dataService
      .list('/product/group-by/city', { organization: this.organization._id })
      .pipe(
        pluck('body'),
        tap(productsByCity => this._productsByCitySubject$.next(productsByCity))
      );

    return concat(
      this.webinarsObs$,
      this.organizationPosts$,
      this.organizationBriefs$,
      this.briefResponses$,
      this.productsObs$
    );
  }

  private setInitialViewport(width: number) {
    this.viewport = width <= 761 ? 'mobile' : 'desktop';
  }
}
