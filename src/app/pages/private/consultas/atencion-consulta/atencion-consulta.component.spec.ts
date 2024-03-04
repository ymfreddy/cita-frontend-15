import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AtencionConsultaComponent } from './atencion-consulta.component';

describe('AtencionConsultaComponent', () => {
  let component: AtencionConsultaComponent;
  let fixture: ComponentFixture<AtencionConsultaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AtencionConsultaComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AtencionConsultaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
