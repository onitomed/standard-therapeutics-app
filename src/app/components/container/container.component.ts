import { Component, OnInit } from '@angular/core';
import { ReportsService } from 'src/app/services/reports.service';
import { UserService } from 'src/app/services/user.service';
import { User } from 'src/app/models/User';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';



@Component({
    selector: 'app-container',
    templateUrl: './container.component.html',
    styleUrls: ['./container.component.css'],
    standalone: false
})
export class ContainerComponent implements OnInit {
  user?: User;
  

  constructor(private reportsService: ReportsService,
    private userService: UserService, private router: Router, private titleService: Title) {
      this.titleService.setTitle("User Profile - Standard Therapeutics");
    }

  ngOnInit(): void {
  }

  showReports() {
    this.userService.getUser().subscribe((user) => {
      this.user = user;
    })

    this.reportsService.findById()
    .subscribe((response) => {
      if (!response?.body) {
        return;
      }
      const byteArray = new Uint8Array(atob(response.body).split('').map(char => char.charCodeAt(0)));
      const file = new Blob([byteArray], {type: 'application/pdf'});
      const fileURL = URL.createObjectURL(file);
      window.open(fileURL, 'width=1000, height=800');
    });

  }

  logout() {
    this.userService.logout();
    this.router.navigateByUrl('/');
  }

}
