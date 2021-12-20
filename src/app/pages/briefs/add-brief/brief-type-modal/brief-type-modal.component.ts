import { Component, ViewEncapsulation, OnInit, OnDestroy } from '@angular/core';
import { PopoverController, NavParams } from '@ionic/angular';
import { Router } from '@angular/router';
import { DataService } from '@app/services/data.service';
import { BriefAddWizardService } from '@app/services/brief-add-wizard.service';

@Component({
  selector: 'app-brief-type-modal',
  templateUrl: './brief-type-modal.component.html',
  styleUrls: ['./brief-type-modal.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class BriefTypeModalComponent implements OnInit, OnDestroy {
  briefTypes: any[] = [];
  isLoading = false;

  constructor(
    public popover: PopoverController,
    private navParams: NavParams,
    private router: Router,
    private dataService: DataService,
    private briefWizardService: BriefAddWizardService
  ) {}

  async ngOnInit() {
    this.isLoading = true;
    await this.dataService
      .list('/brief/brief-type')
      .toPromise()
      .then(briefTypes => {
        this.briefTypes = briefTypes.body.filter(briefType => briefType.type !== 5);
      });
    // create an html id using the brief name
    this.briefTypes.forEach(function(item) {
      item.html_id = item.name.replace(/\s/g, '-').toLowerCase();
    });
    console.log(this.briefTypes);
    this.isLoading = false;
  }

  ngOnDestroy() {}

  onAccept() {
    this.popover.dismiss();
    this.router.navigate(['/briefs/add-brief'], { replaceUrl: true });
  }

  // changeSelection(type: any) {
  //   const briefType = type._id;
  //   this.briefWizardService.briefType = briefType;
  //   localStorage.setItem('briefType', type._id);
  // }

  changeContact(type: any) {
    this.briefTypes.forEach((briefTypes: any) => {
      if (briefTypes._id !== type._id && briefTypes.selected === true) {
        briefTypes.selected = !briefTypes.selected;
      } else if (briefTypes._id === type._id) {
        briefTypes.selected = true;
        this.briefWizardService.briefType = type._id;
      }
    });
  }

  get typeSelected() {
    const hasSelected = this.briefTypes.some(type => {
      return type.selected === true;
    });
    return hasSelected;
  }

  onCancel() {
    this.popover.dismiss();
  }
}
