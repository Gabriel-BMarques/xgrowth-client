import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { IonicModule } from '@ionic/angular';
import { Angulartics2Module } from 'angulartics2';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../../material.module';
import { SharedModule } from '@app/shared';
import { CollectionsRoutingModule } from './collections-routing.module';
import { MyCollectionsComponent } from './my-collections/my-collections.component';
import { CollectionDetailsComponent } from './collection-details/collection-details.component';
import { AddmembersComponent } from './add-members/add-members.component';
import { AddCollectionComponent } from './my-collections/add-collection/add-collection.component';
import { DeleteCollectionComponent } from './collection-details/delete-collection/delete-collection.component';
import { MatInputModule } from '@angular/material/input';

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
    CollectionsRoutingModule,
    MatInputModule
  ],
  entryComponents: [AddCollectionComponent, DeleteCollectionComponent],
  declarations: [
    MyCollectionsComponent,
    CollectionDetailsComponent,
    AddmembersComponent,
    AddCollectionComponent,
    DeleteCollectionComponent
  ]
})
export class CollectionsModule {}
