import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Component({
    selector: 'app-add-reports',
    templateUrl: './add-reports.component.html',
    styleUrls: ['./add-reports.component.css'],
    standalone: false
})
export class AddReportsComponent implements OnInit {

  constructor(private titleService: Title) {
    this.titleService.setTitle("Add Reports - Standard Therapeutics");
  }

  ngOnInit(): void {
  }

}
