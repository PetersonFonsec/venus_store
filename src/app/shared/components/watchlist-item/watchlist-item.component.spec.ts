import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WatchlistItemComponent } from './watchlist-item.component';

describe('WatchlistItemComponent', () => {
  let component: WatchlistItemComponent;
  let fixture: ComponentFixture<WatchlistItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WatchlistItemComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WatchlistItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
