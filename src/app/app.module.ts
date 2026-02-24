import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { authInterceptorProviders } from './helpers/auth.interceptor';
import {ClipboardModule} from '@angular/cdk/clipboard';





import { AppComponent } from './app.component';
import { HeaderComponent } from './components/header/header.component';
import { HeaderItemComponent } from './components/header-item/header-item.component';
import { ContainerComponent } from './components/container/container.component';
import { ButtonComponent } from './components/button/button.component';
import { AddReportsComponent } from './pages/add-reports/add-reports.component';
import { FileUploadComponent } from './components/file-upload/file-upload.component';
import { RegisterComponent } from './pages/register/register.component';
import { UserProfileComponent } from './components/user-profile/user-profile.component';
import { LoginComponent } from './components/login/login.component';
import { ReportsComponent } from './pages/reports/reports.component';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { ViewComponent } from './pages/view/view.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { SpinnerComponent } from './components/spinner/spinner.component';
import { SelectpatientComponent } from './components/selectpatient/selectpatient.component';
import { FooterComponent } from './components/footer/footer.component';
import { NgxChartsModule } from '@swimlane/ngx-charts';


const appRoutes: Routes = [
  {path: 'home', component: ContainerComponent},
  {path: 'add-reports', component: AddReportsComponent},
  {path: 'register', component: RegisterComponent},
  {path: '', component: LoginComponent},
  {path: 'reports', component: ReportsComponent},
  {path: 'view', component: ViewComponent}
]

@NgModule({ declarations: [
        AppComponent,
        HeaderComponent,
        HeaderItemComponent,
        ContainerComponent,
        ButtonComponent,
        AddReportsComponent,
        FileUploadComponent,
        RegisterComponent,
        UserProfileComponent,
        LoginComponent,
        ReportsComponent,
        ViewComponent,
        SpinnerComponent,
        SelectpatientComponent,
        FooterComponent,
    ],
    bootstrap: [AppComponent], imports: [BrowserModule, RouterModule.forRoot(appRoutes, { enableTracing: true }), FormsModule, PdfViewerModule, ClipboardModule, NoopAnimationsModule, NgxChartsModule], providers: [authInterceptorProviders, { provide: LocationStrategy, useClass: HashLocationStrategy }, provideHttpClient(withInterceptorsFromDi())] })
export class AppModule { }
