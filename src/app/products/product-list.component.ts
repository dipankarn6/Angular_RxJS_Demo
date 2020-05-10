import { Component, ChangeDetectionStrategy } from '@angular/core';

import { EMPTY, Subject, Observable, combineLatest, BehaviorSubject } from 'rxjs';
import { ProductService } from './product.service';
import { catchError, map, startWith } from 'rxjs/operators';
import { ProductCategoryService } from '../product-categories/product-category.service';

@Component({
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductListComponent {
  pageTitle = 'Product List';
  private errorSubject = new Subject<string>();
  private errorMessageAction$ = this.errorSubject.asObservable();
  private categrorySelectedSubject = new BehaviorSubject<number>(0);
  private selectedCategoryAction$ = this.categrorySelectedSubject.asObservable();
  constructor(private productService: ProductService, private categoryService: ProductCategoryService) { }

  products$ = combineLatest([
    this.productService.addedProducts$,
    this.selectedCategoryAction$
    // .pipe(
    //   startWith(0)
    // )
  ])
    .pipe(
      map(([products, selectedId]) =>
        products.filter(product => selectedId ? product.categoryId === selectedId : true)
      ),
      catchError(err => {
        this.errorSubject.next(err);
        return EMPTY;
      }));

  productCategories$ = this.categoryService.productCategories$
    .pipe(
      catchError(err => {
        this.errorSubject.next(err);
        return EMPTY;
      })
    );

  onAdd(): void {
    this.productService.productAdded();
  }

  onSelected(categoryId: string): void {
    this.categrorySelectedSubject.next(+categoryId);
  }
}
