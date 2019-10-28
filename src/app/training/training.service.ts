import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { TrainingLoop } from '../models/TrainingLoop';
import { TrainingSet } from '../models/TrainingSet';
import { Word } from '../models/Word';
import { Observable, of, from, interval, throwError } from 'rxjs';
import { mergeAll, catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TrainingService {

  nodeServerAddress = environment.backendIp;
  userId: number;

  static getTrainingSets(): Observable<Array<TrainingSet>> {
    const tl = new TrainingLoop();

    return of(tl.trainingSets).pipe();
  }


  constructor(private http: HttpClient) {

  }

 getTrainingLoop(): Observable<TrainingLoop> {

    return this.http.get<TrainingLoop>(`${this.nodeServerAddress}:3000/training/init/lang/en-ru`);

  }

  getFakeAnswers(id: Number, lang: String): Observable<Array<Word>> {
    console.log('id: ' + id + ' lang: ' + lang)
    const url = `${this.nodeServerAddress}:3000/training/fakeAnswers/${id}/lang/${lang}`;
    return this.http.get<Array<Word>>(url);
  }

  private getTrainingSet(): TrainingSet {
    // TODO

    return new TrainingSet();
  }

  public updateUserProgress(word: Word, cnt: Number): Observable<any> {
    console.log('updateUserProgress: ' + word.id);
    const url = `${this.nodeServerAddress}:3000/training/progress/word/${word.id}/cnt/${cnt}`;

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
