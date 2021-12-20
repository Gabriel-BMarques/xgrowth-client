import { ModalProductsComponent } from './modals/modal-products/modal-products.component';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '@app/material.module';
import { BriefLoopComponent } from '@app/pages/briefs/brief-loop/brief-loop.component';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { LazyLoadImagesModule } from 'ngx-lazy-load-images';
import { LineTruncationDirective, LineTruncationLibModule } from 'ngx-line-truncation';
import { LinkyModule } from 'ngx-linky';
import { NgxMasonryModule } from 'ngx-masonry';
import { LoginTabsComponent } from '../login-tabs/login-tabs.component';
import { BriefPostCardComponent } from './components/brief-post-card/brief-post-card.component';
import { ImageModalComponent } from './modals/image-modal/image-modal.component';
import { ItemComponent } from './components/item/item.component';
import { LoaderComponent } from './loader/loader.component';
import { MasonryPopOverComponent } from './popovers/masonry-pop-over/masonry-pop-over.component';
import { MasonryComponent } from './components/masonry/masonry.component';
import { ModalPostComponent } from './modals/modal-post/modal-post.component';
import { ModalReferSolverComponent } from './modals/modal-refer-solver/modal-refer-solver.component';
import { ReferSolverPopoverComponent } from './modals/modal-refer-solver/refer-solver-popover/refer-solver-popover.component';
import { OrganizationProfileImcompleteComponent } from './popovers/organization-profile-imcomplete/organization-profile-imcomplete.component';
import { PanelComponent } from './components/panel/panel.component';
import { PasswordStrengthBarComponent } from './components/password-strength-bar/password-strength-bar.component';
import { BriefDatePipe } from './pipes/brief-date.pipe';
import { DateAgoPipe } from './pipes/date-ago.pipe';
import { TruncatePipe } from './pipes/truncate.pipe';
import { PopoverCancelComponent } from './popovers/popover-cancel/popover-cancel.component';
import { SkeletonComponent } from './skeleton/skeleton.component';
import { TutorialComponent } from './components/tutorial/tutorial.component';
import { SolverLoopComponent } from '@app/pages/view-solvers/solver-loop/solver-loop.component';
import { WorldMapModalComponent } from './modals/world-map-modal/world-map-modal.component';
import { WorldMapComponent } from './components/world-map/world-map.component';
import { HighchartsChartModule } from 'highcharts-angular';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { InterestsCompletePopoverComponent } from './popovers/interests-complete-popover/interests-complete-popover.component';
import { ContactModalComponent } from './modals/contact-modal/contact-modal.component';
import { RatingModalComponent } from './modals/rating-modal/rating-modal.component';
import { PostModalRatingComponent } from './modals/post-modal-rating/post-modal-rating.component';
import { PostingRateComponent } from './components/posting-rate/posting-rate.component';
import { ModalShowAllRatingsComponent } from './modals/modal-show-all-ratings/modal-show-all-ratings.component';
import { RatingFooterComponent } from './components/rating-footer/rating-footer.component';
import { BackButtonComponent } from './components/back-button/back-button.component';
@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    NgxMasonryModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    MaterialModule,
    LinkyModule,
    TranslateModule,
    LineTruncationLibModule,
    InfiniteScrollModule,
    LazyLoadImagesModule,
    HighchartsChartModule
  ],
  declarations: [
    LoaderComponent,
    PanelComponent,
    ItemComponent,
    SkeletonComponent,
    LoginTabsComponent,
    DateAgoPipe,
    BriefDatePipe,
    TruncatePipe,
    ModalReferSolverComponent,
    ReferSolverPopoverComponent,
    BriefPostCardComponent,
    TutorialComponent,
    ImageModalComponent,
    PopoverCancelComponent,
    MasonryComponent,
    OrganizationProfileImcompleteComponent,
    MasonryPopOverComponent,
    ModalPostComponent,
    BriefLoopComponent,
    PasswordStrengthBarComponent,
    SolverLoopComponent,
    WorldMapModalComponent,
    WorldMapComponent,
    ModalProductsComponent,
    InterestsCompletePopoverComponent,
    ContactModalComponent,
    RatingModalComponent,
    PostModalRatingComponent,
    PostingRateComponent,
    ModalShowAllRatingsComponent,
    RatingFooterComponent,
    BackButtonComponent
  ],
  exports: [
    LoaderComponent,
    PanelComponent,
    ItemComponent,
    SkeletonComponent,
    LoginTabsComponent,
    DateAgoPipe,
    BriefDatePipe,
    TruncatePipe,
    ModalReferSolverComponent,
    ReferSolverPopoverComponent,
    BriefPostCardComponent,
    TutorialComponent,
    ImageModalComponent,
    PopoverCancelComponent,
    MasonryComponent,
    OrganizationProfileImcompleteComponent,
    MasonryPopOverComponent,
    ModalPostComponent,
    BriefLoopComponent,
    PasswordStrengthBarComponent,
    SolverLoopComponent,
    WorldMapModalComponent,
    WorldMapComponent,
    ModalProductsComponent,
    InterestsCompletePopoverComponent,
    ContactModalComponent,
    RatingModalComponent,
    PostModalRatingComponent,
    PostingRateComponent,
    ModalShowAllRatingsComponent,
    RatingFooterComponent,
    BackButtonComponent,
    LineTruncationDirective
  ],
  entryComponents: [LoginTabsComponent, ImageModalComponent, PopoverCancelComponent],
  providers: [DateAgoPipe, BriefDatePipe]
})
export class SharedModule {}
