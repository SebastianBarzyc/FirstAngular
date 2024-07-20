import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { tap, catchError  } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ExerciseService {
  private apiUrl = 'http://localhost:3000/api/exercises';
  private apiUrlEdit = 'http://localhost:3000/api/update-exercise/';
  private apiUrlDelete = 'http://localhost:3000/api/delete-exercise/';
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

  editExercise(id: number, newTitle: string, newDescription: string): Observable<any> {
    const body = { id, newTitle, newDescription };

    return this.http.put<any>(this.apiUrlEdit, body).pipe(
        catchError(error => {
        console.error('Error editing exercise:', error);
        throw error;
      })
    );
  }

  deleteExercise(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrlDelete}${id}`).pipe(
      tap(() => {
        this.refreshNeeded$.next();
      })
    );
  }
}