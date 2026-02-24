import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/services/user.service';
import { User } from 'src/app/models/User';
import { PatientService } from 'src/app/services/patient.service';
import { PatientSm } from 'src/app/models/Patientsm';
import { Observable } from 'rxjs';
import { Patient } from 'src/app/models/Patient';
import { TokenStorageService } from 'src/app/services/token-storage.service';
import { SelectpatientService } from 'src/app/services/selectpatient.service';


@Component({
    selector: 'app-selectpatient',
    templateUrl: './selectpatient.component.html',
    styleUrls: ['./selectpatient.component.css'],
    standalone: false
})
export class SelectpatientComponent implements OnInit {

  user!: User; 
  patients!: [PatientSm];
  patientSm!: string;
  

  constructor(private userService: UserService, private patientService: PatientService, private tokenStorageService: TokenStorageService, private selectpatientService: SelectpatientService) { }

  sendMessage(): void {
    // send message to subscribers via observable subject
    this.selectpatientService.sendUpdate('patientupdated');
  }

  ngOnInit(): void {
    this.userService.getUser().subscribe((user) => {
      this.user = user
      
      this.getPatients().subscribe((obj:[PatientSm]) => {
        this.patients=obj
        
        if (this.patients.length!=null) {
          const p = this.patients.find((patient)=> patient.id==this.user.patientId)
          if (p!=null) {
            this.patientSm = p.name
          }
          else
            this.patientSm = this.patients[0].name
        }
      })
    });
  }
  getPatients(): Observable<[PatientSm]>{
    return this.patientService.getAllPatients()
  }
  getPatientFromName(patientName: string) {
    this.patients.forEach(patient => {
      if (patient.name == patientName)
        return patient
      return null
    })
    
  }
  onChange(patientName: string) {
    
    const p = this.patients.find((patient)=> patient.name==patientName)
    if (p!=null) {
      this.patientService.getPatientById(p.id).subscribe((patient: Patient) => {
      this.tokenStorageService.saveToken(patient.token)
      this.user.patientId = p.id
      this.tokenStorageService.saveUser(this.user)
      this.sendMessage()
    })
  }
    
}

}
