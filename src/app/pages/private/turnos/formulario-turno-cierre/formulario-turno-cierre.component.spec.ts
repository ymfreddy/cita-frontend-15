import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormularioTurnoCierreComponent } from './formulario-turno-cierre.component';

describe('FormularioTurnoCierreComponent', () => {
  let component: FormularioTurnoCierreComponent;
  let fixture: ComponentFixture<FormularioTurnoCierreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FormularioTurnoCierreComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormularioTurnoCierreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
