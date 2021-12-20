import { Component, Input, OnChanges, OnInit } from '@angular/core';
import * as Highcharts from 'highcharts/highmaps';
import * as worldMap from '@highcharts/map-collection/custom/world.geo.json';
import { ICountry } from '@app/shared/models/country.model';
import { DataService } from '@app/services/data.service';

@Component({
  selector: 'app-world-map',
  templateUrl: './world-map.component.html',
  styleUrls: ['./world-map.component.scss']
})
export class WorldMapComponent implements OnInit, OnChanges {
  @Input() organizationReach: ICountry[];
  @Input() chartWidth: number;
  @Input() chartHeigth: number;

  loading: boolean = true;
  Highcharts: typeof Highcharts = Highcharts;
  chartConstructor = 'mapChart';
  updateFlag = false;

  chartOptions: any = {
    chart: {
      map: worldMap.default as any,
      plotBorderColor: '#ffffff'
    },
    exporting: {
      enabled: true
    },
    credits: {
      enabled: false
    },
    mapNavigation: {
      enabled: true,
      buttonOptions: {
        alignTo: 'spacingBox'
      },
      enableDoubleClickToZoom: true,
      enableMouseWheelZoom: true,
      mouseWheelSensitivity: 1.2
    },
    legend: {
      enabled: false
    },
    colorAxis: {
      dataClasses: [
        {
          to: 0,
          color: '#CACACA'
        },
        {
          from: 1,
          color: '#87C8DC'
        }
      ],
      type: 'linear',
      labels: {
        format: '{value}'
      }
    },
    series: [
      {
        type: 'map',
        name: 'Country',
        states: {
          hover: {
            enabled: false
          }
        },
        dataLabels: {
          enabled: false
        },
        allAreas: true
      }
    ],
    tooltip: {
      formatter: function() {
        return '<b>' + this.point.name + '</b><br>';
      }
    }
  };

  get organizationReachCountryCodes(): string[] {
    return this.organizationReach.map(or => or.description.toLowerCase());
  }

  constructor(private dataService: DataService) {}

  async ngOnInit(): Promise<void> {
    this.chartOptions.series[0].data = await this.getMapData();
    this.chartOptions.chart.width = this.chartWidth || null;
    this.chartOptions.chart.heigth = this.chartHeigth || null;
    this.loading = false;
  }

  async ngOnChanges(changes: any) {
    if (changes['chartWidth'] && this.chartWidth) {
      this.loading = true;
      this.chartOptions.chart.width = this.chartWidth || null;
      this.chartOptions.series[0].data = await this.getMapData();
      this.loading = false;
    }
  }

  private async getMapData() {
    let countriesData = (await this.dataService.list('/misc/country').toPromise()).body.map(c => [
      c.description.toLowerCase(),
      this.countrySelected(c)
    ]);
    return countriesData;
  }

  private countrySelected(country: ICountry): number {
    let countryCode = country.description.toLowerCase();
    if (this.organizationReachCountryCodes.includes(countryCode)) return 1;
    else return 0;
  }
}
