import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import { ReportsService } from 'src/app/services/reports.service';
import { Router } from '@angular/router';
import { HttpResponse } from '@angular/common/http';
import { User } from 'src/app/models/User';
import { Title } from '@angular/platform-browser';


@Component({
    selector: 'app-view',
    templateUrl: './view.component.html',
    styleUrls: ['./view.component.css'],
    standalone: false
})
export class ViewComponent implements OnInit {
  pdfSrc: string = ""
  link: string=""
  copyMessageDisplay = false
  copyMessage = "Copied link to reports"
  noReports = false
  isLoading = false
  errorMessage = "No medical reports found"
  loadingText: string = 'loading  reports'

  constructor(private route: ActivatedRoute, private reportsService: ReportsService, private router: Router, private titleService: Title) {
    this.titleService.setTitle("View Reports - ONITO");
    this.isLoading = true
    let token = null
    this.route.queryParams.subscribe(params => {
      token = params['token']
    })
    if (token != null) {
      this.reportsService.findByToken(token)
        .subscribe((res: HttpResponse<object>)  => {
          if (res!=null) {
            let resBody = JSON.parse(JSON.stringify(res)).body
            if (resBody.hasOwnProperty("stack") && resBody["stack"].includes('TokenExpiredError')) {
              this.noReports = true
              this.isLoading = false
              this.errorMessage = "Permission expired. Ask report owner to reshare link."
            }
            else {
              if (resBody.hasOwnProperty("base64Pdf")) {
                const byteArray = new Uint8Array(atob(resBody["base64Pdf"]).split('').map(char => char.charCodeAt(0)))
                const file = new Blob([byteArray], {type: 'application/pdf'});
                this.pdfSrc = URL.createObjectURL(file);
                this.link = `${window.location.href}`
                this.isLoading = false
              }
            }
          }
      }, (err) => {
        this.isLoading = false
        this.noReports = true
      });
    }
    else {
      this.isLoading = false
      this.noReports = true
    }
      
  }
  

  ngOnInit(): void {
    
  }
  _copied(element: boolean) {
    this.copyMessageDisplay = element
    {
      try {
        const shareData = {
          title: `Patient medical reports`,
          text: `Private link to patient's medical reports on ONITO`,
          url: this.link
        };
        navigator.share(shareData);
        
      } catch (err) {
        console.log(`Error: ${err}`)
      }
    }
    setTimeout(() => {this.copyMessageDisplay=false}, 5000)
  }
}
