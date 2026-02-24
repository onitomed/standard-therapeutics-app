import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { AuthService } from 'src/app/services/auth.service';
import { ReportsService } from 'src/app/services/reports.service';
import { TokenStorageService } from 'src/app/services/token-storage.service';
@Component({
    selector: 'app-register',
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.css'],
    standalone: false
})
export class RegisterComponent implements OnInit {
  form: any = {
    name: null,
    email: null,
    password: null,
  };
  isSuccessful = false;
  isSignUpFailed = false;
  errorMessage = '';
  isLoading = false
  firstUploaded = false
  constructor(private authService: AuthService, private tokenStorage: TokenStorageService, private reportsService: ReportsService, private titleService: Title) {
    this.titleService.setTitle("Sign Up - Standard Therapeutics");
  }
  ngOnInit(): void {
  }
  onSubmit(): void {
    this.isLoading = true
    const { name, email, password } = this.form;
    this.authService.register(name, email, password).subscribe(
      data => {
        this.tokenStorage.saveToken(data.token);
        this.tokenStorage.saveUser(data);
        this.reportsService.uploadFirst().subscribe({next: () => {
       
          this.isLoading = false
          this.isSuccessful = true;
          this.isSignUpFailed = false;
          this.firstUploaded = true
          
        },
        error: () => {
          this.isLoading = false
        this.isSuccessful = true;
        this.isSignUpFailed = false;
          
        }})
        
      },
      err => {
        this.isLoading = false
        this.errorMessage = err.error.message;
        this.isSignUpFailed = true;
      }
    );
  }
}