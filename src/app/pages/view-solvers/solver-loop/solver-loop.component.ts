import { Router } from '@angular/router';
import { WorldMapModalComponent } from '@app/shared/modals/world-map-modal/world-map-modal.component';
import { ModalController } from '@ionic/angular';
import { DataService } from '@app/services/data.service';
import { Component, OnInit, Input } from '@angular/core';
import { ICountry } from '@app/shared/models/country.model';
import * as _ from 'lodash';
import { ModalProductsComponent } from '@app/shared/modals/modal-products/modal-products.component';
import { ViewMoreModalComponent } from '@app/shared/modals/view-more-modal/view-more-modal.component';

@Component({
  selector: 'app-solver-loop',
  templateUrl: './solver-loop.component.html',
  styleUrls: ['./solver-loop.component.scss']
})
export class SolverLoopComponent implements OnInit {
  @Input() solvers: any[];
  skeletonLoading = true;
  space = ', ';

  constructor(private dataService: DataService, private modalController: ModalController, private router: Router) {}

  async ngOnInit() {
    this.skeletonLoading = false;
  }

  getNames(array: any[]): string {
    let elementNames = '';
    let i = 1;
    array.forEach(element => {
      elementNames = elementNames + element.name;
      if (i < array.length) {
        elementNames = elementNames + ', ';
      }
      i++;
    });
    return elementNames;
  }

  async openMap(organizationReach: ICountry[]): Promise<void> {
    if (window.innerWidth <= 700) {
      (
        await this.modalController.create({
          component: ViewMoreModalComponent,
          cssClass: 'world-map-modal',
          componentProps: {
            items: organizationReach,
            modalTitle: 'organization reach',
            type: 'organizationReach'
          }
        })
      ).present();
    } else {
      (
        await this.modalController.create({
          component: WorldMapModalComponent,
          cssClass: 'world-map-modal',
          componentProps: {
            organizationReach
          }
        })
      ).present();
    }
  }

  async viewOrganization(id: any) {
    await this.router.navigate([`/organization/${id}/overview`], { replaceUrl: true });
  }

  handler(res: boolean, type: string, solver: any) {
    switch (type) {
      case 'whoWeAre':
        solver.hasTruncatedWhoWeAre = res;
        solver.readLessWhoWeAre = res;
        break;
      case 'skills':
        solver.hasTruncatedSkills = res;
        solver.readLessSkills = res;
        break;
      case 'certifications':
        solver.hasTruncatedCertifications = res;
        solver.readLessCertifications = res;
        break;
      case 'segments':
        solver.hasTruncatedSegments = res;
        solver.readLessSegments = res;
        break;
      case 'subSegments':
        solver.hasTruncatedSubSegments = res;
        solver.readLessSubSegments = res;
        break;
    }
  }

  readMore(type: string, solver: any) {
    switch (type) {
      case 'whoWeAre':
        solver.hasTruncatedWhoWeAre = false;
        break;
      case 'skills':
        solver.hasTruncatedSkills = false;
        break;
      case 'certifications':
        solver.hasTruncatedCertifications = false;
        break;
      case 'segments':
        solver.hasTruncatedSegments = false;
        break;
      case 'subSegments':
        solver.hasTruncatedSubSegments = false;
        break;
    }
  }

  readLess(type: string, solver: any) {
    switch (type) {
      case 'whoWeAre':
        solver.hasTruncatedWhoWeAre = true;
        break;
      case 'skills':
        solver.hasTruncatedSkills = true;
        break;
      case 'certifications':
        solver.hasTruncatedCertifications = true;
        break;
      case 'segments':
        solver.hasTruncatedSegments = true;
        break;
      case 'subSegments':
        solver.hasTruncatedSubSegments = true;
        break;
    }
  }

  async viewAllProducts(products: any[]): Promise<void> {
    (
      await this.modalController.create({
        component: ModalProductsComponent,
        cssClass: 'modal-products',
        componentProps: {
          products: products
        }
      })
    ).present();
  }
}
