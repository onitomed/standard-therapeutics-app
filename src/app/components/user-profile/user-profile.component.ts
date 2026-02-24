import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/services/user.service';
import { User } from 'src/app/models/User';
import { PatientService } from 'src/app/services/patient.service';
import { PatientSm } from 'src/app/models/Patientsm';
import { Observable } from 'rxjs';
import { Patient } from 'src/app/models/Patient';
import { TokenStorageService } from 'src/app/services/token-storage.service';
import { SelectpatientComponent } from '../selectpatient/selectpatient.component';
SelectpatientComponent

@Component({
    selector: 'app-user-profile',
    templateUrl: './user-profile.component.html',
    styleUrls: ['./user-profile.component.css'],
    standalone: false
})

export class UserProfileComponent implements OnInit {
  user!: User; 
  showAddPatientMenu = false
  form: any = {
    sharelink: '',
    name: ''
  };
  newpt= false
  existingPatientForm = true
  newPatientForm = false
  errors:[string] = ['']
  submitted = false
  added=false
  
  constructor(private userService: UserService, private patientService: PatientService, private tokenStorageService: TokenStorageService) { }

  ngOnInit(): void {
    this.userService.getUser().subscribe((user) => {
      this.user = user
    });
    
  }
  addPatientMenu() {
    if (this.showAddPatientMenu == false)
      this.showAddPatientMenu = true
    else
      this.showAddPatientMenu = false
  }
  onSubmit() {
    this.errors = ['']
    this.submitted = true
    if (!this.newpt) {
      const token = this.form.sharelink.slice(this.form.sharelink.search('token=')+6,this.form.sharelink.length)
      
      this.patientService.addPatientAccess(token).subscribe({
        next: (res) => {
          this.added = true
          this.tokenStorageService.saveToken(res.token)
          setTimeout(() => {}, 5000)
          this.reloadPage()
        },
        error: (e) => {
          this.errors.push(e.error.message)
        }
      })
      
    }
  }
  onSubmitNew() {
    this.submitted = true
    if (this.newpt) {
      const name = this.form.name
      
      
      this.patientService.addNewPatient(name).subscribe({
        next: (res) => {
          this.added = true
          this.tokenStorageService.saveToken(res.token)
          setTimeout(() => {}, 5000)
          this.reloadPage()
          
        },
        error: (e) => {
          this.errors.push(e.error.message)
        }
      })
      
    }
  }
  onSelectionChange(newpt: Boolean) {
    if (newpt) {
      
      this.newPatientForm = true
      this.existingPatientForm = false
    }
    else {
      
      this.existingPatientForm = true
      this.newPatientForm = false
    }
  }
  reloadPage(): void {
    window.location.reload();
  }
}
