import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectpatientComponent } from './selectpatient.component';

describe('SelectpatientComponent', () => {
  let component: SelectpatientComponent;
  let fixture: ComponentFixture<SelectpatientComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SelectpatientComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectpatientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
