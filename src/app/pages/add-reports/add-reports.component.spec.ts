import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddReportsComponent } from './add-reports.component';

describe('AddReportsComponent', () => {
  let component: AddReportsComponent;
  let fixture: ComponentFixture<AddReportsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddReportsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
