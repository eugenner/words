import { AuthService } from './auth.service';
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler } from '@angular/common/http';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) { }

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    const jwt = JSON.parse(localStorage.getItem('user')).stsTokenManager.accessToken;
    console.log('jwt: ' + jwt);
    if (!!jwt) {
     req = req.clone({
       setHeaders: {
         Authorization: `Bearer ${jwt}`
       }
     });
   }
   return next.handle(req);

  }
}
