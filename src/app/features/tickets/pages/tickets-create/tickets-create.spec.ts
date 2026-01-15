import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TicketsCreate } from './tickets-create';

describe('TicketsCreate', () => {
  let component: TicketsCreate;
  let fixture: ComponentFixture<TicketsCreate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TicketsCreate]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TicketsCreate);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
