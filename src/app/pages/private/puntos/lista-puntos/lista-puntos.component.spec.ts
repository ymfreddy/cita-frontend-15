import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaPuntosComponent } from './lista-puntos.component';

describe('ListaPuntosComponent', () => {
  let component: ListaPuntosComponent;
  let fixture: ComponentFixture<ListaPuntosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListaPuntosComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListaPuntosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
