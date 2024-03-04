import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormularioTurnoAperturaComponent } from './formulario-turno-apertura.component';

describe('FormularioTurnoAperturaComponent', () => {
  let component: FormularioTurnoAperturaComponent;
  let fixture: ComponentFixture<FormularioTurnoAperturaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FormularioTurnoAperturaComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormularioTurnoAperturaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
