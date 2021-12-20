import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from '@app/app.module';
import { environment } from '@env/environment';
import { hmrBootstrap } from './hmr';

if (environment.production) {
  enableProdMode();
  if (window) {
    window.console.log = function() {};
  }
}

platformBrowserDynamic()
  .bootstrapModule(AppModule, { preserveWhitespaces: true })
  .catch(err => console.log(err));
