import { Component, OnDestroy, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { I18nService, Logger, untilDestroyed } from '@app/core';
import { environment } from '@env/environment';
import { Keyboard } from '@ionic-native/keyboard/ngx';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Platform } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { Angulartics2GoogleAnalytics } from 'angulartics2/ga';
import { merge } from 'rxjs';
import { filter, map, switchMap } from 'rxjs/operators';
import { slideInAnimation } from './route-animation';
import { NavigationService } from './services/navigation.service';
import { LanguageComponent } from './shell/header/language/language.component';

declare let window: any;

const log = new Logger('App');

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [slideInAnimation]
})
export class AppComponent implements OnInit, OnDestroy {
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private titleService: Title,
    private translateService: TranslateService,
    private platform: Platform,
    private keyboard: Keyboard,
    private statusBar: StatusBar,
    private splashScreen: SplashScreen,
    // do not remove the analytics injection, even if the call in ngOnInit() is removed
    // this injection initializes page tracking through the router
    private angulartics2GoogleAnalytics: Angulartics2GoogleAnalytics,
    private i18nService: I18nService,
    private languageComponent: LanguageComponent,
    private navigationService: NavigationService
  ) {
    navigationService.listenRouteEvents();
  }

  async ngOnInit() {
    // Setup logger
    if (environment.production) {
      Logger.enableProductionMode();
    }

    log.debug('init');

    this.angulartics2GoogleAnalytics.startTracking();
    this.angulartics2GoogleAnalytics.eventTrack(environment.version, { category: 'App initialized' });

    // Setup translations
    this.i18nService.init(environment.defaultLanguage, environment.supportedLanguages);

    const onNavigationEnd = this.router.events.pipe(filter(event => event instanceof NavigationEnd));

    // Change page title on navigation or language change, based on route data
    merge(this.translateService.onLangChange, onNavigationEnd)
      .pipe(
        map(() => {
          let route = this.activatedRoute;
          while (route.firstChild) {
            route = route.firstChild;
          }
          return route;
        }),
        filter(route => route.outlet === 'primary'),
        switchMap(route => route.data),
        untilDestroyed(this)
      )
      .subscribe(event => {
        const title = event.title;
        if (title) {
          this.titleService.setTitle(this.translateService.instant(title));
        }
      });

    this.setDefaultLanguage();

    // Cordova platform and plugins initialization
    await this.platform.ready();
    this.onCordovaReady();
  }

  ngOnDestroy() {
    this.i18nService.destroy();
  }

  private onCordovaReady() {
    log.debug('device ready');

    if (window.cordova) {
      log.debug('Cordova init');

      this.keyboard.hideFormAccessoryBar(true);
      this.statusBar.styleLightContent();
      this.splashScreen.hide();
    }
  }

  private setDefaultLanguage() {
    this.languageComponent.switchEnglish();
  }
}
