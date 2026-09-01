import { Component, OnInit } from '@angular/core';
import { ReportsService } from 'src/app/services/reports.service';
import { PdfCacheService } from 'src/app/services/pdf-cache.service';
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
  

  constructor(private reportsService: ReportsService, private userService: UserService, router: Router, private selectpatientService: SelectpatientService, private titleService: Title, private pdfCacheService: PdfCacheService) {
    this.titleService.setTitle("Medical Reports - Standard Therapeutics");

    this.host = `${window.location.origin}`
    this.isLoading = true
    this.router = router
    this.reportsService.getShareLink()
    .subscribe((linkObj: linkObject): void => {
      this.link = `${this.host}/#/view?token=${linkObj['link']}`

    })
    // Wait for the user (and its id) before touching the PDF cache, so the
    // cache key is scoped per-patient rather than shared across whoever is
    // logged in on this browser — a family sharing one device must never
    // be shown a previous patient's cached report.
    this.userService.getUser().subscribe((user) => {
      this.user = user
      this.loadReport()
    });
   }

  private cacheKey(): string {
    return `report-pdf:${this.user._id}`
  }

  private showBlob(blob: Blob): void {
    if (this.pdfSrc) {
      URL.revokeObjectURL(this.pdfSrc)
    }
    this.pdfSrc = URL.createObjectURL(blob)
    this.isLoading = false
  }

  private loadReport(): void {
    const key = this.cacheKey()
    this.pdfCacheService.get(key).then((cached) => {
      if (cached) {
        // Instant render from the last-known-good copy — no network wait —
        // while a conditional request below confirms it's still current.
        this.loadingText = 'Loading Reports'
      }

      this.reportsService.findById(cached?.etag)
      .subscribe({
        next: (response) => {
          if (response === null) {
            // 304 Not Modified — the cached copy is confirmed current.
            this.showBlob(cached!.blob)
            return
          }
          const b64String = response.body ?? ''
          const byteArray = new Uint8Array(atob(b64String).split('').map(char => char.charCodeAt(0)));
          const file = new Blob([byteArray], {type: 'application/pdf'});
          this.showBlob(file)
          const etag = response.headers.get('ETag')
          if (etag) {
            this.pdfCacheService.set(key, etag, file)
          }
        },
        error: () => {
          this.isLoading = false
        }
      });
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
