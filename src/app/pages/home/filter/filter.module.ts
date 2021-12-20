import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { NgxMasonryModule } from 'ngx-masonry';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FilterCategoryComponent } from './filter-category/filter-category.component';
import { FilterLocationComponent } from './filter-location/filter-location.component';

@NgModule({
  imports: [IonicModule, CommonModule, NgxMasonryModule, FormsModule, ReactiveFormsModule, RouterModule],
  declarations: [FilterCategoryComponent, FilterLocationComponent],
  entryComponents: [FilterCategoryComponent, FilterLocationComponent]
})
export class FilterModule {}
