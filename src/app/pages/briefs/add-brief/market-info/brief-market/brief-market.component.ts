import { OnInit, Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { HeaderService } from '@app/services/header.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { PanelData } from '@app/shared/models/panelData.model';
import { IItem, Item } from '@app/shared/models/item.model';
import { IonContent } from '@ionic/angular';
import { MockService } from '@app/services/mock.service';
import { ActivatedRoute, Router } from '@angular/router';
import { BriefAddWizardService } from '@app/services/brief-add-wizard.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ICountry } from '@app/shared/models/country.model';
import { DataService } from '@app/services/data.service';
import { IBriefMarket, BriefMarket } from '@app/shared/models/briefMarket.model';
import { NotificationService } from '@app/services/notification.service';
import { IAlertControtllerGuard } from '@app/shared/i-alert-controtller-guard';
import { NavigationService } from '@app/services/navigation.service';
import * as _ from 'lodash';

@Component({
  selector: 'app-brief-market',
  templateUrl: './brief-market.component.html',
  styleUrls: ['./brief-market.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class BriefMarketComponent implements OnInit, IAlertControtllerGuard {
  skeletonLoading = true;
  isLoading = true;
  header: string;
  searchbar: string;
  briefId: string;
  marketsMock: any[];
  markets: string[];
  marketsSelected: any[];
  selectAllCheck: boolean;
  isIndeterminate: boolean;
  countries: ICountry[] = [];
  selectedCountries: ICountry[] = [];
  briefMarkets: IBriefMarket[] = [];
  countryData: MatTableDataSource<ICountry>;
  briefMarketForm: FormGroup;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(IonContent, { static: true }) contentArea: IonContent;

  constructor(
    private mockService: MockService,
    private headerService: HeaderService,
    private route: ActivatedRoute,
    private wizard: BriefAddWizardService,
    private dataService: DataService,
    private router: Router,
    private formBuilder: FormBuilder,
    private navigationService: NavigationService
  ) {
    this.createForm();
  }

  ngOnInit() {
    this.verifyHeaderLang();
    this.headerService.setHeader(this.header);
    this.headerService.setHeader(this.searchbar);
    this.loadData();
    this.dataService
      .list('/misc/country')
      .toPromise()
      .then(countries => {
        this.countries = countries.body;
        this.countryData = new MatTableDataSource(this.countries);
        if (this.wizard.entity.Markets) {
          this.prepareSelection();
        }
        this.skeletonLoading = false;
        this.isLoading = false;
      });
  }

  ionViewWillEnter() {}

  loadData() {
    this.briefId = this.wizard.entity._id;
    this.briefMarketForm.controls.countries.setValue(this.wizard.step3Form.controls.countries.value);
  }

  checkSelectAll() {}

  verifyHeaderLang() {
    if (localStorage.getItem('language') === 'en-US') {
      this.header = 'Select Market';
      this.searchbar = 'Search for Market';
    } else if (localStorage.getItem('language') === 'pt-BR') {
      this.header = 'Selecionar Market';
      this.searchbar = 'Procurar Market';
    }
  }

  prepareSelection() {
    const briefMarketIds = this.wizard.entity.Markets;

    this.countries.map((country: any) => {
      const found = briefMarketIds.some(briefMarketId => {
        return briefMarketId === country._id;
      });
      if (found) {
        this.briefMarketForm.controls.countries.value.push(country);
        this.selectedCountries.push(country);
        country.isChecked = true;
      } else {
        country.isChecked = false;
      }
    });
    if (this.briefMarkets.length > 0) {
      this.wizard.step3Form.controls.countries.setValue(this.briefMarketForm.controls.countries.value);
    }
  }

  applyFilter(filterValue: any) {
    if (filterValue === null) {
      this.countryData.filter = '';
    } else {
      this.countryData = new MatTableDataSource(this.countries);
      this.countryData.filter = filterValue.trim().toLowerCase();
    }

    if (this.countryData.paginator) {
      this.countryData.paginator.firstPage();
    }
  }

  select(entity: any) {
    if (entity.isChecked) {
      if (!this.briefMarketForm.controls.countries.value.includes(entity)) {
        this.selectedCountries.push(entity);
        this.briefMarketForm.controls.countries.setValue(this.selectedCountries);
      }
    } else {
      if (this.briefMarketForm.controls.countries.value.includes(entity)) {
        const index = this.selectedCountries.indexOf(entity);
        this.selectedCountries.splice(index, 1);
        this.briefMarketForm.controls.countries.setValue(this.selectedCountries);
      }
    }
  }

  briefMarketExists(entity: any) {
    const found = this.briefMarkets.some((briefMarket: any) => {
      return briefMarket.CountryId._id === entity._id;
    });
    if (found) {
      return true;
    } else {
      return false;
    }
  }

  selectAll() {
    this.countryData.filteredData.map((country: any) => {
      if (!this.selectAllCheck) {
        if (country.isChecked) {
          country.isChecked = true;
        } else {
          country.isChecked = true;
        }
      } else {
        if (country.isChecked) {
          country.isChecked = false;
        } else {
          country.isChecked = false;
        }
      }
    });
  }

  back() {
    if (this.wizard.step3Form.controls.countries.value.length === 0) {
      this.briefMarketForm.controls.countries.setValue([]);
      this.router.navigate(['/briefs/add-brief/market-info'], { replaceUrl: true });
    } else {
      if (this.wizard.isEditing) {
        this.router.navigate(['/briefs/add-brief/market-info/edit', this.wizard.entity._id], { replaceUrl: true });
      } else {
        this.router.navigate(['/briefs/add-brief/market-info'], { replaceUrl: true });
      }
    }
  }

  confirmSelection() {
    // this.wizard.step3Form.controls.countries.setValue(this.briefMarketForm.controls.countries.value);
    this.wizard.step3Form.controls.countries = _.cloneDeep(this.briefMarketForm.controls.countries);
    if (this.wizard.isEditing) {
      this.router.navigate(['/briefs/add-brief/market-info/edit', this.wizard.entity._id], { replaceUrl: true });
    } else {
      this.router.navigate(['/briefs/add-brief/market-info'], { replaceUrl: true });
    }
  }

  onChanges(): void {
    this.briefMarketForm.valueChanges.subscribe(() => {
      this.wizard.step3Form.controls.countries = _.cloneDeep(this.briefMarketForm.controls.countries);
      this.wizard.saveChanges();
    });
  }

  createForm() {
    this.briefMarketForm = this.formBuilder.group({
      countries: [[], Validators.required]
    });
    setTimeout(() => {
      this.briefMarketForm.controls.countries.setValue([]);
      this.onChanges();
    }, 100);
  }
  canDeactivate() {
    if (this.wizard.isEditing) {
      return this.navigationService.generateAlertBrief(
        'Discard Brief?',
        'If you leave the brief edition now, you will lose the edited information',
        'Discard',
        'Keep'
      );
    } else {
      return this.navigationService.generateAlertBrief(
        'Discard Brief?',
        'If you leave the brief creation now, you will lose the edited information',
        'Discard',
        'Keep'
      );
    }
  }
}
