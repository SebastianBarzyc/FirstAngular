import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ExerciseService {
  private apiUrl = 'http://localhost:3000/api/exercises';
  private refreshNeeded$ = new Subject<void>();

  constructor(private http: HttpClient) {}

  getData(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  addExercise(exercise: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, exercise).pipe(
      tap(() => {
        this.refreshNeeded$.next();
      })
    );
  }
  onRefreshNeeded(): Observable<void> {
    return this.refreshNeeded$.asObservable();
  }
}
