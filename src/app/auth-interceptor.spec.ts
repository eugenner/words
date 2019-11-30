import { async } from '@angular/core/testing';
import { Injectable } from '@angular/core';
import { Observable, of as observableOf, throwError } from 'rxjs';

import {Component} from '@angular/core';
import {AuthInterceptor} from './auth-interceptor';
import {AuthService} from './auth.service';

describe('AuthInterceptor', () => {
  let service;

@Injectable()
class MockAuthService {}  
  beforeEach(() => {
    // TODO: Think about is there anything can do with constructor mocks(?), things done within constructor
    service = new AuthInterceptor({});
  });

  it('should run #intercept()', async () => {
    service.authService = service.authService || {};
    service.authService.getAccessToken = jest.fn();
    service.addToken = jest.fn();
    service.handle401Error = jest.fn();
    service.intercept({}, {
      handle : function() {
        return {
          pipe : jest.fn()
        };
      }
    });
    expect(service.authService.getAccessToken).toHaveBeenCalled();
    expect(service.addToken).toHaveBeenCalled();
    expect(service.handle401Error).toHaveBeenCalled();
  });

  it('should run #addToken()', async () => {

    service.addToken({
      clone : jest.fn()
    }, {});

  });

  it('should run #handle401Error()', async () => {
    service.refreshTokenSubject = service.refreshTokenSubject || {};
    service.refreshTokenSubject.next = jest.fn();
    service.refreshTokenSubject = service.refreshTokenSubject || {};
    service.refreshTokenSubject.pipe = jest.fn();
    service.authService = service.authService || {};
    service.authService.refreshToken = jest.fn().mockReturnValue({
      pipe : jest.fn()
    });
    service.addToken = jest.fn();
    service.handle401Error({}, {
      handle : jest.fn()
    });
    expect(service.refreshTokenSubject.next).toHaveBeenCalled();
    expect(service.refreshTokenSubject.pipe).toHaveBeenCalled();
    expect(service.authService.refreshToken).toHaveBeenCalled();
    expect(service.addToken).toHaveBeenCalled();
  });

});
