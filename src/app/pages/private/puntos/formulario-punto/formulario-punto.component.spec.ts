import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormularioPuntoComponent } from './formulario-punto.component';

describe('FormularioPuntoComponent', () => {
  let component: FormularioPuntoComponent;
  let fixture: ComponentFixture<FormularioPuntoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FormularioPuntoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormularioPuntoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
