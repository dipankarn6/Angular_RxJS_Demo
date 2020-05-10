import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { throwError, of } from 'rxjs';
import { Supplier } from './supplier';
import { map, concatMap, mergeMap, tap, switchMap, catchError, shareReplay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SupplierService {
  suppliersUrl = 'api/suppliers';

  supliersWithconcatMap$ = of(1, 5, 8)
    .pipe(
      tap(id => console.log(`Concat Map : ${id}`)),
      concatMap(
        id => this.http.get<Supplier>(`${this.suppliersUrl}/${id}`)
      )
    );
  constructor(private http: HttpClient) {
    // this.supliersWithconcatMap$.subscribe(console.log);
    // this.supliersWithMergeMap$.subscribe(console.log);
    // this.supliersWithswitchMap$.subscribe(console.log);
  }

  supliersWithMergeMap$ = of(1, 5, 8)
    .pipe(
      tap(id => console.log(`Merge Map : ${id}`)),
      mergeMap(
        id => this.http.get<Supplier>(`${this.suppliersUrl}/${id}`)
      )
    );

  supliersWithswitchMap$ = of(1, 5, 8)
    .pipe(
      tap(id => console.log(`Switch Map : ${id}`)),
      switchMap(
        id => this.http.get<Supplier>(`${this.suppliersUrl}/${id}`)
      )
    );

  suppliers$ = this.http.get<Supplier[]>(this.suppliersUrl)
    .pipe(
      tap(data => console.log('Suppliers : ', data)),
      shareReplay(1),
      catchError(this.handleError)
    );
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
