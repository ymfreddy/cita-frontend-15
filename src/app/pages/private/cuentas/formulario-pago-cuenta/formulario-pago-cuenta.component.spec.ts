import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormularioPagoCuentaComponent } from './formulario-pago-cuenta.component';

describe('FormularioPagoCuentaComponent', () => {
  let component: FormularioPagoCuentaComponent;
  let fixture: ComponentFixture<FormularioPagoCuentaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FormularioPagoCuentaComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormularioPagoCuentaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
