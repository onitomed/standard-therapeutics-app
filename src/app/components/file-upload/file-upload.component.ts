import { HttpClient } from '@angular/common/http';
import { Component, OnInit, Input } from '@angular/core';
import { FileuploadService } from 'src/app/services/fileupload.service';


@Component({
    selector: 'app-file-upload',
    templateUrl: './file-upload.component.html',
    styleUrls: ['./file-upload.component.css'],
    standalone: false
})

export class FileUploadComponent implements OnInit {
  @Input() format!: string;
  @Input() labeltext = 'Choose File';
  @Input() dummy: boolean = false;
  fileToUpload: File | null = null;
  uploadStatus: string = 'waiting';
  isLoading = false
  
  
  constructor(private httpService: HttpClient, private fileUploadService: FileuploadService) { 
  }

  ngOnInit(): void {
  }

  handleFileInput(event: Event) {
    
    const target = event.target as HTMLInputElement;
    this.fileToUpload = (target.files as FileList)[0];
  }

  uploadFile() {
    if (this.fileToUpload && !this.dummy) {
      this.isLoading = true
      this.fileUploadService.uploadFile(this.fileToUpload).subscribe({next: () => {
        this.isLoading = false
        this.uploadStatus = 'completed'
        
      },
      error: () => {
        this.isLoading = false
        this.uploadStatus = 'error'
        
      }})
    }
  }

}
