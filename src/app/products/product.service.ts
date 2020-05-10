import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { throwError, combineLatest, Subject, merge, from } from 'rxjs';
import { catchError, tap, map, scan, shareReplay, mergeMap, toArray, filter } from 'rxjs/operators';

import { Product } from './product';
import { SupplierService } from '../suppliers/supplier.service';
import { ProductCategoryService } from '../product-categories/product-category.service';
import { Supplier } from '../suppliers/supplier';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  constructor(private http: HttpClient,
    private supplierService: SupplierService, private categoryService: ProductCategoryService) { }
  private productsUrl = 'api/products';
  private suppliersUrl = this.supplierService.suppliersUrl;

  private selectedProductSubject = new Subject<number>();
  private selectedProductAction$ = this.selectedProductSubject.asObservable();

  products$ = this.http.get<Product[]>(this.productsUrl)
    .pipe(
      tap(data => console.log('Products: ', JSON.stringify(data))),
      catchError(this.handleError)
    );


  productsWithCategories$ = combineLatest([this.products$, this.categoryService.productCategories$])
    .pipe(
      map(
        ([products, categories]) =>
          products.map(
            product => ({
              ...product,
              price: product.price * 1.5,
              searchKey: [product.productName],
              category: categories.find(c => c.id === product.categoryId).name
            }) as Product
          )
      ),
      shareReplay(1)
    );

  selectedProduct$ = combineLatest([
    this.productsWithCategories$,
    this.selectedProductAction$
  ])
    .pipe(
      map(([products, selectedId]) => products.find(p => p.id === selectedId)),
      catchError(err => {
        console.log(err);
        return throwError(err);
      })
    );

  suppliersForProduct$ = combineLatest([
    this.selectedProduct$,
    this.supplierService.suppliers$
  ])
    .pipe(
      map(([product, suppliers]) =>
        suppliers.filter(supplier => product.supplierIds.includes(supplier.id))
      )
    );
  // suppliersForProduct$ = this.selectedProduct$
  //   .pipe(
  //     filter(product => Boolean(product)),
  //     mergeMap(
  //       product => from(product.supplierIds)
  //         .pipe(
  //           mergeMap(
  //             supplierId => this.http.get<Supplier>(`${this.suppliersUrl}/${supplierId}`)
  //           ),
  //           toArray(),
  //           tap(data => console.log(data))
  //         )
  //     )
  //   );


  private addedProductSubject = new Subject<Product>();
  private addedProductAction$ = this.addedProductSubject.asObservable();

  addedProducts$ = merge(
    this.productsWithCategories$,
    this.addedProductAction$
  ).pipe(
    scan((acc: Product[], value: Product) => [...acc, value])
  );

  productSelected(selectedId: number): void {
    this.selectedProductSubject.next(selectedId);
  }

  productAdded(newPeod?: Product): void {
    const prodToAdd = newPeod || this.fakeProduct();
    this.addedProductSubject.next(prodToAdd);
  }


  private fakeProduct() {
    return {
      id: 42,
      productName: 'Another One',
      productCode: 'TBX-0042',
      description: 'Our new product',
      price: 8.9,
      categoryId: 3,
      category: 'Toolbox',
      quantityInStock: 30
    };
  }

  private handleError(err: any) {
    // in a real world app, we may send the server to some remote logging infrastructure
    // instead of just logging it to the console
    let errorMessage: string;
    if (err.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      errorMessage = `An error occurred: ${err.error.message}`;
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      errorMessage = `Backend returned code ${err.status}: ${err.body.error}`;
    }
    console.error(err);
    return throwError(errorMessage);
  }

}
