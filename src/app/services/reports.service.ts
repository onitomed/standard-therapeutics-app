import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
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

  // Pass the ETag from a previously cached PDF to make this a conditional
  // request. The backend replies 304 (no body) when it's still current —
  // Angular's HttpClient surfaces any non-2xx status, 304 included, through
  // the error channel rather than as a normal response, so that case is
  // caught here and turned into a plain `null` for the caller instead of
  // propagating as an error.
  public findById(ifNoneMatch?: string): Observable<HttpResponse<string> | null> {
    this.userService.getUser().subscribe((user) => {
      this.user = user
    })
    let headers = new HttpHeaders();
    if (ifNoneMatch) {
      headers = headers.set('If-None-Match', ifNoneMatch);
    }
    return this.httpClient.get(url, { responseType: 'text', observe: 'response', headers }).pipe(
      catchError((err: HttpErrorResponse) => {
        if (err.status === 304) {
          return of(null);
        }
        return throwError(() => err);
      })
    );
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
