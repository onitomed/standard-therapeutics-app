import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { TokenStorageService } from 'src/app/services/token-storage.service';
import { LegendPosition, NgxChartsModule, ScaleType } from '@swimlane/ngx-charts';

const p1 = [{
    "name": "Healthy patient 1",
    "series": [
      {
        "name": "Endothelial",
        "value": 377
      },
      {
        "name": "Fibroblast",
        "value": 486
      },
      {
        "name": "Myeloid",
        "value": 110
      },
      {
        "name": "T cell",
        "value": 53
      },
      {
        "name": "B cell",
        "value": 20
      },
      {
        "name": "Natural Killer cell",
        "value": 15
      },
    ]
}]
const p2 = [{
  "name": "RA patient 1",
  "series": [
    {
      "name": "Endothelial",
      "value": 100
    },
    {
      "name": "Fibroblast",
      "value": 36
    },
    {
      "name": "Myeloid",
      "value": 340
    },
    {
      "name": "T cell",
      "value": 780
    },
    {
      "name": "B cell",
      "value": 796
    },
    {
      "name": "Natural Killer cell",
      "value": 58
    },
  ]
}]
const p3 = [{
  "name": "RA patient 2",
  "series": [
    {
      "name": "Endothelial",
      "value": 107
    },
    {
      "name": "Fibroblast",
      "value": 586
    },
    {
      "name": "Myeloid",
      "value": 123
    },
    {
      "name": "T cell",
      "value": 114
    },
    {
      "name": "B cell",
      "value": 118
    },
    {
      "name": "Natural Killer cell",
      "value": 22
    },
  ]
}]

@Component({
    selector: 'app-aitp',
    templateUrl: './aitp.component.html',
    styleUrls: ['./aitp.component.css'],
    standalone: false
})
export class AitpComponent implements OnInit {

  patientSm!:string
  patients = ['Healthy patient 1', 'RA patient 1', 'RA patient 2']
  isLoggedIn = false
  p1: any[] = [];
  view:[number,number] = [1000, 204];
  mdview:[number,number] = [600, 204];
  smview:[number,number] = [400, 204];
  pdata = {
    ctap: "None",
    total_cells: 1061,
    rec: 'None'
  }


  // options
  showXAxis: boolean = true;
  showYAxis: boolean = true;
  gradient: boolean = true;
  showLegend: boolean = true;
  showXAxisLabel: boolean = true;
  xAxisLabel: string = 'SYNOVIUM CELL TYPE PROPORTION';
  showYAxisLabel: boolean = false;
  yAxisLabel: string = '';
  public legendPosition: LegendPosition = LegendPosition.Below
  colorScheme = {
    name: 'new',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: [
    '#002240',
    '#5CE1E6',
    '#004AAB',
    '#7ED958',
    '#d9534f',
    '#a7b61a',
  ]
};


  constructor(private titleService: Title, private tokenStorageService: TokenStorageService) {
    this.titleService.setTitle("Autoimmune disease treatment planner - ONITO");
    Object.assign(this, { p1 });
    this.view = [innerWidth / 1.3, 204];
  }
  

  ngOnInit(): void {
    if (this.tokenStorageService.getToken()) {
      this.isLoggedIn = true;
    }
    this.patientSm = 'Healthy patient 1'
    
  }
  onChange(patientName: string) {
    if (patientName == 'Healthy patient 1') {
      this.p1 = p1
      this.pdata = {
        ctap: "None",
        total_cells: 1061,
        rec: 'None'
      }
    }
    if (patientName == 'RA patient 1') {
      this.p1 = p2
      this.pdata = {
        ctap: "T cell + B cell",
        total_cells: 2110,
        rec: 'Rituximab'
      }
    }
    if (patientName == 'RA patient 2') {
      this.p1 = p3
      this.pdata = {
        ctap: "Fibroblast",
        total_cells: 1070,
        rec: 'Sarilumab'
      }
    }
    
  }
  onSelect(event: any) {
    console.log(event);
  }
  onResize(event: any) {
    this.view = [event.target.innerWidth/1.28, 204];
}

}
