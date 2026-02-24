import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FileuploadService {
   private uploadUrl = `${environment.apiUrl}/api/patientdata`

  constructor(private httpClient: HttpClient) {}
  uploadFile(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('dataFile', file);
    return this.httpClient.post(this.uploadUrl, formData);
  }
}
