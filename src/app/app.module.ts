import { DatePipe, HashLocationStrategy, LocationStrategy } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { ServiceWorkerModule } from '@angular/service-worker';
import { CoreModule } from '@app/core';
import { SharedModule } from '@app/shared';
import { environment } from '@env/environment';
import { FileChooser } from '@ionic-native/file-chooser/ngx';
import { FilePath } from '@ionic-native/file-path/ngx';
import { FileTransfer } from '@ionic-native/file-transfer/ngx';
import { File } from '@ionic-native/file/ngx';
import { Keyboard } from '@ionic-native/keyboard/ngx';
import { Push } from '@ionic-native/push/ngx';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { NgbModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { IonicModule } from '@ionic/angular';
import { IonicStorageModule } from '@ionic/storage';
import { TranslateModule } from '@ngx-translate/core';
import { Angulartics2Module } from 'angulartics2';
import { IonicSelectableModule } from 'ionic-selectable';
import { NgxMasonryModule } from 'ngx-masonry';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthExpiredInterceptor } from './core/interceptor/auth-expired.interceptor';
import { AuthInterceptor } from './core/interceptor/auth.interceptor';
import { MaterialModule } from './material.module';
import { PopoverLeaveOrganizationComponent } from './pages/organization/profile/organization-edit/popover-leave-organization/popover-leave-organization.component';
import { FilterModule } from './pages/home/filter/filter.module';
import { ModalValidationComponent } from './shared/modals/modal-validation/modal-validation.component';
import { LanguageComponent } from './shell/header/language/language.component';
import { ShellModule } from './shell/shell.module';
@NgModule({
  imports: [
    BrowserModule,
    ServiceWorkerModule.register('./ngsw-worker.js', { enabled: environment.production }),
    FormsModule,
    HttpClientModule,
    TranslateModule.forRoot(),
    BrowserAnimationsModule,
    MaterialModule,
    IonicModule.forRoot(),
    IonicStorageModule.forRoot(),
    CoreModule,
    SharedModule,
    ShellModule,
    FilterModule,
    RouterModule,
    ReactiveFormsModule,
    NgbTooltipModule,
    IonicSelectableModule,
    NgbModule,
    NgxMasonryModule,
    Angulartics2Module.forRoot(),
    AppRoutingModule // must be imported as the last module as it contains the fallback route
  ],
  declarations: [AppComponent, PopoverLeaveOrganizationComponent, ModalValidationComponent],
  providers: [
    Keyboard,
    StatusBar,
    SplashScreen,
    FileChooser,
    // tslint:disable-next-line: deprecation
    FileTransfer,
    FilePath,
    File,
    Push,
    LanguageComponent,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthExpiredInterceptor,
      multi: true
    },
    {
      provide: LocationStrategy,
      useClass: HashLocationStrategy
    },
    DatePipe
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
