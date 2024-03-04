import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AsignarAsistenciaComponent } from './asignar-asistencia.component';

describe('AsignarAsistenciaComponent', () => {
  let component: AsignarAsistenciaComponent;
  let fixture: ComponentFixture<AsignarAsistenciaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AsignarAsistenciaComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AsignarAsistenciaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
