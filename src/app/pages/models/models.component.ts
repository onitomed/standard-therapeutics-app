import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Component({
    selector: 'app-models',
    templateUrl: './models.component.html',
    styleUrls: ['./models.component.css'],
    standalone: false
})
export class ModelsComponent implements OnInit {

  constructor(private titleService: Title) {
    this.titleService.setTitle("Tools - ONITO");
  }

  ngOnInit(): void {
    
  }

}
