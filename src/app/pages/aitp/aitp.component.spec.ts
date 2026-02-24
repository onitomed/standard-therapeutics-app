import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AitpComponent } from './aitp.component';

describe('AitpComponent', () => {
  let component: AitpComponent;
  let fixture: ComponentFixture<AitpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AitpComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AitpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
