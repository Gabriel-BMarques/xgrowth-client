import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { IonicModule } from '@ionic/angular';
import { Angulartics2Module } from 'angulartics2';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../../material.module';
import { SharedModule } from '@app/shared';
import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './home.component';

@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
    IonicModule,
    HomeRoutingModule,
    SharedModule,
    Angulartics2Module,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule
  ],
  declarations: [HomeComponent]
})
export class HomeModule {}
