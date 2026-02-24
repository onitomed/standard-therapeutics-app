import { Component, OnInit, Input, Output} from '@angular/core';

@Component({
    selector: 'app-header-item',
    templateUrl: './header-item.component.html',
    styleUrls: ['./header-item.component.css'],
    standalone: false
})
export class HeaderItemComponent implements OnInit {

  @Input() text!: string;
  @Input() route?: string;

  constructor() {
   }

  ngOnInit(): void {
  }

}
