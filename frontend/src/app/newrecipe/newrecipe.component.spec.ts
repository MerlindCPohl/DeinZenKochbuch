import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewrecipeComponent } from './newrecipe.component';

describe('NewrecipeComponent', () => {
  let component: NewrecipeComponent;
  let fixture: ComponentFixture<NewrecipeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewrecipeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewrecipeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
