import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { LoginContext, RegistrationContext, CreationContext } from '../authentication/authentication.service';
import { CredentialsService } from '../authentication/credentials.service';
import { UserInfoService } from '@app/services/user-info.service';

@Injectable()
export class AuthServerProvider {
  constructor(
    private http: HttpClient,
    private credentialsService: CredentialsService,
    private userInfoService: UserInfoService
  ) {}

  login(credentials: LoginContext): Observable<any> {
    const data = {
      email: credentials.username,
      password: credentials.password
    };

    return this.http.post('/auth/login', data, { observe: 'response' }).pipe(map(authenticateSuccess.bind(this)));

    async function authenticateSuccess(resp: any) {
      const response = {
        username: resp.body.user.email,
        token: resp.body.token.accessToken || null,
        profileComplete: resp.body.user.profileComplete,
        country: resp.body.user.country,
        role: resp.body.user.role,
        status: resp.body.status || null,
        message: resp.body.message || null
      };

      if (!response.status && !response.message) {
        this.credentialsService.setCredentials(response);
        await this.userInfoService.setUserInfo();
        return resp.body.user;
      } else {
        return resp.body.status;
      }
    }
  }

  impersonate(credentials: LoginContext): Observable<any> {
    const data = {
      email: credentials.username,
      password: credentials.password,
      impersonation: credentials.impersonation
    };

    return this.http.post('/auth/impersonate', data, { observe: 'response' }).pipe(map(authenticateSuccess.bind(this)));

    async function authenticateSuccess(resp: any) {
      const cred = {
        username: resp.body.user.email,
        token: resp.body.token.accessToken,
        profileComplete: resp.body.user.profileComplete,
        country: resp.body.user.country,
        role: resp.body.user.role,
        impersonation: credentials.impersonation
      };
      this.credentialsService.setCredentials(cred);
      await this.userInfoService.setUserInfo();

      return resp.body.user;
    }
  }

  register(credentials: RegistrationContext): Observable<any> {
    return this.http.post('/auth/register', credentials, { observe: 'response' });
  }

  create(credentials: CreationContext): Observable<any> {
    return this.http.post('/auth/create', credentials, { observe: 'response' });
  }

  activate(activationKey: string): Observable<any> {
    const params = new HttpParams().set('activationKey', activationKey);
    return this.http.get('/auth/activate', { observe: 'response', params });
  }

  reactivate(reactivationKey: string): Observable<any> {
    const params = new HttpParams().set('reactivationKey', reactivationKey);
    return this.http.get('/auth/reactivate', { observe: 'response', params });
  }

  resetPassword(email: string): Observable<any> {
    const data = {
      email
    };

    return this.http.post('/auth/forgot-password', data, { observe: 'response' });
  }

  generateReactivationLink(email: string): Observable<any> {
    const data = {
      email
    };

    return this.http.post('/auth/get-reactlink', data, { observe: 'response' });
  }

  verifyDomain(email: any): Observable<any> {
    return this.http.post(`/auth/verifyDomain`, email, { observe: 'response' });
  }
}
