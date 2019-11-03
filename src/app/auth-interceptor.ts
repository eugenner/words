import { AuthService } from './auth.service';
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler } from '@angular/common/http';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(public authService: AuthService) { }

  intercept(request: HttpRequest<any>, next: HttpHandler) {
    const jwt = JSON.parse(localStorage.getItem('user')).stsTokenManager.accessToken;
    // console.log('jwt: ' + jwt);
    if (!!jwt) {
     request = request.clone({
       setHeaders: {
         Authorization: `Bearer ${jwt}`
       }
     });
   }
   return next.handle(request);

  }
}
