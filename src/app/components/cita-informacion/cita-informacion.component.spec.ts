import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CitaInformacionComponent } from './cita-informacion.component';

describe('CitaInformacionComponent', () => {
  let component: CitaInformacionComponent;
  let fixture: ComponentFixture<CitaInformacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CitaInformacionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CitaInformacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
