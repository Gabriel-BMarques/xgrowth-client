import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, EMPTY } from 'rxjs';
import { environment } from '@env/environment';
import { IpDataService } from '@app/services/ip-data.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor() {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (
      !request ||
      !request.url ||
      (/^http/.test(request.url) && !(environment.serverUrl && request.url.startsWith(environment.serverUrl)))
    ) {
      return next.handle(request);
    }

    request = request.clone({
      setHeaders: {
        'x-api-key': environment.x_api_key
      }
    });

    const credentials = localStorage.getItem('credentials') || sessionStorage.getItem('credentials');

    if (!!credentials) {
      const token = JSON.parse(credentials).token;

      if (!!token) {
        request = request.clone({
          setHeaders: {
            Authorization: 'Bearer ' + token
          }
        });
      }
    }

    return next.handle(request);
  }
}
