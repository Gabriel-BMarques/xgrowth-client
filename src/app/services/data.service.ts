import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

type EntityResponseType = HttpResponse<any>;
type EntityArrayResponseType = HttpResponse<any[]>;
type EntityResponseTypeFile = HttpResponse<any>;

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private _transientObject: any;

  constructor(private http: HttpClient) {}

  getUserInfo(): Observable<any> {
    return this.http.get(`/users/loggedIn`, { observe: 'response' });
  }

  getUserProfile(): Observable<any> {
    return this.http.get('/users/profile', { observe: 'response' });
  }

  getUserCompany(): Observable<any> {
    return this.http.get(`/users/company`, { observe: 'response' });
  }

  getUserRelatedCompanies(): Observable<any> {
    return this.http.get(`/users/related-companies`, { observe: 'response' });
  }

  listCoworkers(): Observable<EntityArrayResponseType> {
    return this.http.get<any[]>(`/users/coworkers`, { observe: 'response' });
  }

  listByOrganization(route: string): Observable<EntityArrayResponseType> {
    return this.http.get<any[]>(`${route}`, { observe: 'response' });
  }

  find(route: string, id: string): Observable<EntityResponseType> {
    return this.http.get(`${route}/${id}`, { observe: 'response' });
  }

  findById(route: string, id: string): Observable<EntityArrayResponseType> {
    const query = id || {};
    return this.http.get<any[]>(`${route}/${id}`, { observe: 'response', params: query });
  }

  upload(route: string, formData: FormData): Observable<EntityResponseTypeFile> {
    return this.http.post(`${route}`, formData, { observe: 'response' });
  }

  deleteFile(route: string, requestImgs: any): Observable<any> {
    return this.http.post(`${route}/removeImage`, requestImgs, { observe: 'response' });
  }

  list(route: string, filter?: any): Observable<EntityArrayResponseType> {
    const query = filter || {};
    return this.http.get<any[]>(route, { observe: 'response', params: query });
  }

  listById(route: string, id?: any, fileType?: string): Observable<EntityArrayResponseType> {
    if (fileType) {
      return this.http.get<any[]>(`${route}/list/${id}/${fileType}`, { observe: 'response' });
    } else {
      return this.http.get<any[]>(`${route}/list/${id}`, { observe: 'response' });
    }
  }

  getPopulated(route: string, id: any): Observable<EntityResponseType> {
    return this.http.get<any>(`${route}/populated/${id}`, { observe: 'response' });
  }

  listPopulated(route: string, filter?: any): Observable<EntityArrayResponseType> {
    const query = filter || {};
    return this.http.get<any[]>(`${route}/populated`, { observe: 'response', params: query });
  }

  approveWebinar(entity: any): Observable<EntityResponseType> {
    return this.http.put(`/webinar/approve`, entity, { observe: 'response' });
  }

  publishWebinar(entity: any): Observable<EntityResponseType> {
    return this.http.put(`/webinar/publish`, entity, { observe: 'response' });
  }

  denyWebinar(entity: any): Observable<EntityResponseType> {
    return this.http.put(`/webinar/deny`, entity, { observe: 'response' });
  }

  getByIdGuid(route: string, id?: any): Observable<any> {
    return this.http.get<any>(`${route}/getByGuid/list/${id}`, { observe: 'response' });
  }

  listAll(route: string, filter?: any): Observable<EntityArrayResponseType> {
    const query = filter || {};
    return this.http.get<any[]>(`${route}/all`, { observe: 'response', params: query });
  }

  getCompanyPosts(route: string, id?: string): Observable<EntityArrayResponseType> {
    return this.http.get<any[]>(`${route}/company/${id}`, { observe: 'response' });
  }

  createWebinarInvitations(entity: any): Observable<EntityResponseType> {
    return this.http.post(`/webinar/invitation/${entity._id}`, entity, { observe: 'response' });
  }

  search(route: string, filter?: any): Observable<EntityArrayResponseType> {
    const query = filter || {};
    return this.http.get<any[]>(`${route}/search`, { observe: 'response', params: query });
  }

  create(route: string, entity: any): Observable<EntityResponseType> {
    return this.http.post(`${route}`, entity, { observe: 'response' });
  }

  createMany(route: string, entities: any[]): Observable<EntityArrayResponseType> {
    return this.http.post<any[]>(`${route}/many`, entities, { observe: 'response' });
  }

  updateUser(route: string, entity: any): Observable<EntityResponseType> {
    const id = entity.id || entity._id;
    return this.http.patch(`${route}/${id}`, entity, { observe: 'response' });
  }

  update(route: string, entity: any): Observable<EntityResponseType> {
    return this.http.put(`${route}`, entity, { observe: 'response' });
  }

  remove(route: string, entity: any): Observable<EntityResponseType> {
    return this.http.delete(`${route}/${entity._id}`, { observe: 'response' });
  }

  count(route: string, id?: any, filter?: any): Observable<EntityResponseType> {
    if (id) {
      return this.http.get(`${route}/count/${id}`, { observe: 'response' });
    } else {
      const query = filter || {};
      return this.http.get(`${route}/count`, { observe: 'response', params: query });
    }
  }

  verifyUser(route: string, email: any): Observable<EntityResponseType> {
    return this.http.post(`/users/${route}`, email, { observe: 'response' });
  }

  get transientObject(): any {
    return this._transientObject;
  }

  set transientObject(obj: any) {
    this._transientObject = obj;
  }
}
