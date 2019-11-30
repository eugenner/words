import { AuthService } from './auth.service';
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, throwError } from 'rxjs';
import { catchError, filter, take, switchMap } from 'rxjs/operators';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(public authService: AuthService) { }

  intercept(request: HttpRequest<any>, next: HttpHandler) {
    //   const jwt = JSON.parse(localStorage.getItem('user')).stsTokenManager.accessToken;
    //   // console.log('jwt: ' + jwt);
    //   if (!!jwt) {
    //    request = request.clone({
    //      setHeaders: {
    //        Authorization: `Bearer ${jwt}`
    //      }
    //    });
    //  }

    let skipIntercept = false;
    if (request.url.startsWith('https://securetoken.googleapis.com/v1/token')) {
      skipIntercept = true;
      console.log('skipIntercept = true;');
    }

    if (!skipIntercept && this.authService.getAccessToken()) {
      request = this.addToken(request, this.authService.getAccessToken());
    }

    //  return next.handle(request);
    return next.handle(request).pipe(catchError(error => {

      // console.log('interceptor error: ' + error);

      if (error instanceof HttpErrorResponse && error.status === 401) {
        return this.handle401Error(request, next);
      } else {
        return throwError(error);
      }
    }));

  }

  private addToken(request: HttpRequest<any>, token: string) {
    return request.clone({
      setHeaders: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler) {

    console.log('handle401Error');


    if (!this.isRefreshing) {
      console.log('start Refreshing');
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      return this.authService.refreshToken().pipe(
        switchMap((token: any) => {
          this.isRefreshing = false;
          console.log('stop Refreshing');

          // console.log('refreshing token: ' + JSON.stringify(token));

          this.refreshTokenSubject.next(token.access_token);
          return next.handle(this.addToken(request, token.access_token));
        }));
    } else {
      return this.refreshTokenSubject.pipe(

        // allow only not empty token value
        filter(token => token != null),

        // takes only 1 first value
        take(1),
        switchMap(jwt => {
          return next.handle(this.addToken(request, jwt));
        }));
    }
  }
}
