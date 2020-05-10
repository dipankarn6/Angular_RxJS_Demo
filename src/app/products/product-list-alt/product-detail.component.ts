import { Component } from '@angular/core';

import { ProductService } from '../product.service';
import { catchError, map, filter } from 'rxjs/operators';
import { EMPTY, combineLatest } from 'rxjs';

@Component({
  selector: 'pm-product-detail',
  templateUrl: './product-detail.component.html'
})
export class ProductDetailComponent {

  errorMessage = '';

  constructor(private productService: ProductService) { }

  product$ = this.productService.selectedProduct$
    .pipe(
      catchError(err => {
        this.errorMessage = err;
        return EMPTY;
      })
    );

  pageTitle$ = this.product$
    .pipe(
      map(p => p ? `Product Detail For: ${p.productName}` : null)
    );

  productSuppliers$ = this.productService.suppliersForProduct$
    .pipe(
      catchError(err => {
        this.errorMessage = err;
        return EMPTY;
      })
    );

  vm$ = combineLatest([
    this.product$,
    this.pageTitle$,
    this.productSuppliers$
  ])
    .pipe(
      filter(([product]) => Boolean(product)),
      map(([product, pageTitle, productSuppliers]) =>
        ({ product, pageTitle, productSuppliers })
      )
    );
}
