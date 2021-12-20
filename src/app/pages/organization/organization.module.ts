import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { SharedModule } from '@app/shared';
import { CityValidatorDirective } from '@app/shared/form-directives/city-validator.directive';
import { CountryValidatorDirective } from '@app/shared/form-directives/country-validator.directive';
import { StateProvinceValidatorDirective } from '@app/shared/form-directives/state-province-validator.directive';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { Angulartics2Module } from 'angulartics2';
import { LinkyModule } from 'ngx-linky';
import { FileUploadModule } from 'primeng/fileupload';
import { RadioButtonModule } from 'primeng/radiobutton';
import { MaterialModule } from '../../material.module';
import { ViewMoreModalComponent } from '../../shared/modals/view-more-modal/view-more-modal.component';
import { OrganizationRoutingModule } from './organization-routing.module';
import { ManufacturingDetailsComponent } from './profile/organization-edit/manufacturing-details/manufacturing-details.component';
import { OrganizationDetailsComponent } from './profile/organization-edit/organization-details/organization-details.component';
import { OrganizationOverviewComponent } from './profile/organization-edit/organization-overview/organization-overview.component';
import { OrganizationProfileOverviewComponent } from './profile/organization-profile-overview/organization-profile-overview.component';
import { OverviewModalComponent } from './profile/organization-profile-overview/overview-modal/overview-modal.component';
import { OrganizationContentComponent } from './profile/organization-content/organization-content.component';
import { ProductDetailsComponent } from './profile/organization-edit/product-details/product-details.component';
import { ProductEditComponent } from './profile/organization-products/product-edit/product-edit.component';
import { OrganizationProducts } from './profile/organization-products/organization-products.component';
import { ProfileHeaderComponent } from './profile/profile-header/profile-header.component';
import { ShareInXgrowthPopoverComponent } from './profile/profile-header/share-popover/share-in-xgrowth-popover/share-in-xgrowth-popover.component';
import { SharePopoverComponent } from './profile/profile-header/share-popover/share-popover.component';
import { OrganizationEditComponent } from './profile/organization-edit/organization-edit.component';
import { ChangePasswordModalComponent } from './profile/organization-edit/user-profile/change-password-modal/change-password-modal.component';
import { UserProfileComponent } from './profile/organization-edit/user-profile/user-profile.component';
import { ProductListComponent } from './profile/organization-products/product-list/product-list.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { ManufacturingDetailsModalComponent } from './profile/organization-profile-overview/manufacturing-details-modal/manufacturing-details-modal.component';
import { ProductEditMenuComponent } from './profile/organization-products/product-list/product-edit-menu/product-edit-menu.component';
import { ProductCardComponent } from './profile/organization-products/product-list/product-card/product-card.component';
@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
    SharedModule,
    IonicModule,
    Angulartics2Module,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    OrganizationRoutingModule,
    RadioButtonModule,
    FileUploadModule,
    LinkyModule,
    MatToolbarModule,
    MatSidenavModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatExpansionModule
  ],
  declarations: [
    OrganizationEditComponent,
    UserProfileComponent,
    ChangePasswordModalComponent,
    OrganizationOverviewComponent,
    OrganizationDetailsComponent,
    ManufacturingDetailsComponent,
    OrganizationProducts,
    ViewMoreModalComponent,
    CountryValidatorDirective,
    StateProvinceValidatorDirective,
    CityValidatorDirective,
    OrganizationContentComponent,
    ProfileHeaderComponent,
    OrganizationProfileOverviewComponent,
    ProductDetailsComponent,
    ProductEditComponent,
    OverviewModalComponent,
    SharePopoverComponent,
    ShareInXgrowthPopoverComponent,
    ProductListComponent,
    ManufacturingDetailsModalComponent,
    ProductEditMenuComponent,
    ProductCardComponent
  ]
})
export class OrganizationModule {}
