import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TicketsManage } from './tickets-manage';

describe('TicketsManage', () => {
  let component: TicketsManage;
  let fixture: ComponentFixture<TicketsManage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TicketsManage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TicketsManage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
