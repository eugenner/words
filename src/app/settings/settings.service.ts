import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { throwError, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  nodeServerAddress = environment.backendIp;

  constructor(private http: HttpClient) { }

  public updateUserPreferences(data: any): Observable<any> {
    data = JSON.stringify(data);
    const url = `${this.nodeServerAddress}:3000/users/preferences/update/json=${data}`;

    return this.http.get(url).pipe(catchError(this.handleError));
  }

  public getUserPreferences(): Observable<any> {
    const url = `${this.nodeServerAddress}:3000/users/preferences/get`;

    return this.http.get(url).pipe(catchError(this.handleError));
  }

  handleError(error: HttpErrorResponse) {
    let errorMessage = 'Unknown error!';
    if (error.error instanceof ErrorEvent) {
      // Client-side errors
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side errors
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    window.alert(errorMessage);
    return throwError(errorMessage);
  }
}
