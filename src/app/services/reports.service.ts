import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { UserService } from './user.service';
import { User } from '../models/User';
import { environment } from 'src/environments/environment';
const url = `${environment.apiUrl}/api/patientdata`

interface linkObject {
  [key: string]: string  
}

interface repObject {
  data: string,
  resCode: number
}

@Injectable({
  providedIn: 'root'
})

export class ReportsService {
  user!: User;

  constructor(private httpClient: HttpClient, private userService: UserService) { }

  public findById(): Observable<string> {
    this.userService.getUser().subscribe((user) => {
      this.user = user
    })
    return this.httpClient.get(url, { responseType: 'text'});
  }
  public findByToken(token: string): Observable<HttpResponse<object>> {
    return this.httpClient.get(`${environment.apiUrl}/view/${token}`, { observe: 'response'});
  }
  public getShareLink(): Observable<linkObject> {
    return this.httpClient.get<linkObject>(`${url}/share`, { responseType: 'json'});
  }
  public uploadFirst(): Observable<any> {
    return this.httpClient.post(`${url}`, null);
  }
}
