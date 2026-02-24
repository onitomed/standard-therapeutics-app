import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SelectpatientService {

  constructor() { }
  private subjectName = new Subject<any>(); //need to create a subject
    
  sendUpdate(message: string) {
    this.subjectName.next({ text: message }); //next() will feed the value in Subject
  }
    
  getUpdate(): Observable<any> { 
    return this.subjectName.asObservable();
  }
}
