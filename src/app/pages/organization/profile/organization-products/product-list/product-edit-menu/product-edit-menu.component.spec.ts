import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductEditMenuComponent } from './product-edit-menu.component';

describe('ProductEditMenuComponent', () => {
  let component: ProductEditMenuComponent;
  let fixture: ComponentFixture<ProductEditMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProductEditMenuComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductEditMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
