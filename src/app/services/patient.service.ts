import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { UserService } from './user.service';
import { Observable } from 'rxjs';
import { PatientSm } from '../models/Patientsm';
import { Patient } from '../models/Patient';

const apiUrl = `${environment.apiUrl}/api/patient`

@Injectable({
  providedIn: 'root'
})
export class PatientService {

  constructor(private httpClient: HttpClient, private userService: UserService) { }

  public getAllPatients(): Observable<[PatientSm]> {
    return this.httpClient.get<[PatientSm]>(`${apiUrl}/user`, { responseType: 'json'});
  }

  public getPatientById(id: string): Observable<Patient> {
    
    return this.httpClient.get<Patient>(`${apiUrl}/${id}`, {responseType:'json'})
  }
  public addPatientAccess(token: string): Observable<Patient> {
    return this.httpClient.post<Patient>(`${apiUrl}/user`, { patientToken: token },{ responseType: 'json'});
  }
  public addNewPatient(name: string): Observable<Patient> {
    return this.httpClient.post<Patient>(`${apiUrl}`, { name: name, dependent: true },{ responseType: 'json'});
  }
}
