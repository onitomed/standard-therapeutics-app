import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from 'src/app/models/User';
import { UserService } from 'src/app/services/user.service';
import { AuthService } from '../../services/auth.service'
import { TokenStorageService } from '../../services/token-storage.service';
import { Title } from '@angular/platform-browser';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css'],
    standalone: false
})
export class LoginComponent implements OnInit {
  user!: User;
  form: any = {
    email: null,
    password: null
  };
  isLoggedIn = false;
  isLoginFailed = false;
  errorMessage = '';
  role: string[] = [];
  isLoading = false

  constructor(private authService: AuthService, private tokenStorage: TokenStorageService, private userService: UserService, private router:Router, private titleService: Title) {
    this.titleService.setTitle("Standard Therapeutics - Home");
  }
  ngOnInit(): void {
    if (this.tokenStorage.getToken()) {
      this.isLoggedIn = true;
      this.role = this.tokenStorage.getUser().role;
      this.router.navigateByUrl('/');
    }
  }
  onSubmit(): void {
    this.isLoading = true
    const { email, password } = this.form;
    this.authService.login(email, password).subscribe(
      data => {
        this.isLoading=false
        this.tokenStorage.saveToken(data.token);
        
        this.tokenStorage.saveUser(data);
        this.isLoginFailed = false;
        this.isLoggedIn = true;
        this.role = this.tokenStorage.getUser().role;
        this.reloadPage();
        this.userService.getUser().subscribe((user) => {
          this.user = user;
          
        })
        
      },
      err => {
        this.isLoading=false
        this.errorMessage = err.error.message;
        this.isLoginFailed = true;
      }
    );
  }
  reloadPage(): void {
    window.location.reload();
  }

}