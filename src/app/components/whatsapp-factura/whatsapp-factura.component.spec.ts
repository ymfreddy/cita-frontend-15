import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WhatsappFacturaComponent } from './whatsapp-factura.component';

describe('WhatsappFacturaComponent', () => {
  let component: WhatsappFacturaComponent;
  let fixture: ComponentFixture<WhatsappFacturaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WhatsappFacturaComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WhatsappFacturaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
