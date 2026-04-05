import { Component, OnInit } from '@angular/core';
import { ReportsService } from 'src/app/services/reports.service';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { environment } from 'src/environments/environment';
import { User } from 'src/app/models/User';
import { UserService } from 'src/app/services/user.service';
import { Router } from '@angular/router';
import { SelectpatientService } from 'src/app/services/selectpatient.service';
import { Title } from '@angular/platform-browser';


interface linkObject {
  [key: string]: string  
}

@Component({
    selector: 'app-reports',
    templateUrl: './reports.component.html',
    styleUrls: ['./reports.component.css'],
    standalone: false
})

export class ReportsComponent implements OnInit {
  pdfSrc: string = ""
  link: string=""
  copyMessageDisplay = false
  copyMessage = "Copied link to reports"
  host: string = ''
  noReports = false
  isLoading = false
  user!: User
  router!: Router;
  updatePdf: boolean = false
  loadingText: string = 'Loading  Reports'
  

  constructor(private reportsService: ReportsService, private userService: UserService, router: Router, private selectpatientService: SelectpatientService, private titleService: Title) {
    this.titleService.setTitle("Medical Reports - Standard Therapeutics");
  
    this.host = `${window.location.origin}`
    this.isLoading = true
    this.router = router
    this.reportsService.getShareLink()
    .subscribe((linkObj: linkObject): void => {
      this.link = `${this.host}/#/view?token=${linkObj['link']}`
      
    })
    this.userService.getUser().subscribe((user) => {
      this.user = user
    });
    
    this.reportsService.findById()
    .subscribe((b64String: string): void => {
      const byteArray = new Uint8Array(atob(b64String).split('').map(char => char.charCodeAt(0)));
      const file = new Blob([byteArray], {type: 'application/pdf'});
      this.pdfSrc = URL.createObjectURL(file);
      this.isLoading = false
    });
    
    
   }
   _copied(element: boolean) {
    this.copyMessageDisplay = element
    {
      try {
        const shareData = {
          title: `${this.user.name}'s medical reports`,
          text: `Link to ${this.user.name}'s medical reports on Standard Therapeutics:`,
          url: this.link
        };
        navigator.share(shareData);
        
      } catch (err) {
        console.log(`Error: ${err}`)
      }
    }
    setTimeout(() => {this.copyMessageDisplay=false}, 5000)
  }
  reloadCurrentRoute() {
    let currentUrl = this.router.url;
    this.router.navigateByUrl('/', {skipLocationChange: true}).then(() => {
        this.router.navigate([currentUrl]);
    });
  }
  ngOnInit(): void {
    
    this.selectpatientService.getUpdate().subscribe(msg => {
      this.reloadCurrentRoute()
    })
  }

}
