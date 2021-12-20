import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from '@app/services/data.service';
import { UserInfoService } from '@app/services/user-info.service';
import { IOrganization } from '@app/shared/models/organizations.model';
import { IProduct } from '@app/shared/models/product.model';
import { BehaviorSubject, Observable } from 'rxjs';
import { pluck, tap } from 'rxjs/operators';

@Component({
  selector: 'app-organization-products',
  templateUrl: './organization-products.component.html',
  styleUrls: ['./organization-products.component.scss']
})
export class OrganizationProducts implements OnInit {
  isReadMore = true;
  viewport: string;
  @Input() organization: IOrganization | any;
  displayProductForm = true;

  private productsSubject$ = new BehaviorSubject<IProduct[]>([]);

  productsObs$: Observable<any>;

  products$ = this.productsSubject$.asObservable();

  get canEdit(): boolean {
    return this.userInfoService.storedUserInfo.organization._id === this.organization?._id;
  }

  constructor(
    private route: ActivatedRoute,
    private dataService: DataService,
    private router: Router,
    private userInfoService: UserInfoService
  ) {}

  ngOnInit(): void {}

  ionViewWillEnter() {
    this.setInitialViewport(window.innerWidth);
    const { data } = this.route.snapshot.data;
    this.organization = data;

    this.productsObs$ = this.dataService.list('/product', { organization: this.organization._id }).pipe(
      pluck('body'),
      tap(products => this.productsSubject$.next(products))
    );
  }

  showText() {
    this.isReadMore = !this.isReadMore;
  }

  updateList() {
    this.productsObs$.subscribe();
  }

  async addProduct() {
    await this.router.navigate(['organization', this.organization._id, 'edit'], {
      queryParams: { isEditing: true, mode: 'add-product' }
    });
  }

  private setInitialViewport(width: number) {
    this.viewport = width <= 761 ? 'mobile' : 'desktop';
  }
}
