import { Injectable } from '@angular/core';
import { HttpResponse, HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IItem } from '@app/shared/models/item.model';

@Injectable({
  providedIn: 'root'
})
export class PanelService {
  itemsToAdd: IItem[];

  constructor(private http: HttpClient) {}

  addedItems(entity?: IItem) {
    if (entity) {
      this.itemsToAdd.push(entity);
    }
    return this.addedItems;
  }
}
