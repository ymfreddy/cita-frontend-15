import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CuentaDetalleComponent } from './cuenta-detalle.component';

describe('CuentaDetalleComponent', () => {
  let component: CuentaDetalleComponent;
  let fixture: ComponentFixture<CuentaDetalleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CuentaDetalleComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CuentaDetalleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
