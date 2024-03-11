import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnularFacturaComponent } from './anular-factura.component';

describe('AnularFacturaComponent', () => {
  let component: AnularFacturaComponent;
  let fixture: ComponentFixture<AnularFacturaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AnularFacturaComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnularFacturaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
