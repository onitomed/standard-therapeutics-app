import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { TokenStorageService } from 'src/app/services/token-storage.service';


@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.css'],
    standalone: false
})
export class HeaderComponent implements OnInit {
  isLoggedIn = false
  
  public href: string = "";

  constructor(private router: Router, private tokenStorage: TokenStorageService) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
      }
        });
   }

  ngOnInit(): void {
    this.href = this.router.url;
    if (this.tokenStorage.getToken())
      this.isLoggedIn = true
    else
      this.isLoggedIn = false  
  }

  

}
