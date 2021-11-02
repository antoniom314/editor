import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';


@Injectable()
export class HttpHeaderInterseptor implements HttpInterceptor {

  constructor(private router: Router) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    console.log('request');
    console.log(request);

    request = request.clone({setHeaders: {type:'multipart/form-data' }});

    console.log('request');
    console.log(request);

    return next.handle(request).pipe(

      tap(response => {

        if (response instanceof HttpResponse) {

          // const token = response.headers.get('Authorization');

          console.log('response');
          console.log(response);

        }
      })
    );
  }
}
