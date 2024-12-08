// exercise.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ExerciseService {
  private apiUrl = 'http://localhost:3000/api/exercises';
  private apiUrlEdit = 'http://localhost:3000/api/update-exercise/';
  private apiUrlDelete = 'http://localhost:3000/api/delete-exercise/';
  private refreshNeeded$ = new Subject<void>();
  private searchResultsSubject = new BehaviorSubject<any[]>([]);
  searchResults$ = this.searchResultsSubject.asObservable();

  constructor(private http: HttpClient) {}

  getData(): Observable<any> {
    const token = localStorage.getItem('token');
    console.log('Token:', token);
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<any>(this.apiUrl, { headers });
  }
  
  addExercise(exercise: any): Observable<any> {
    const token = localStorage.getItem('token');
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });
    return this.http.post<any>(this.apiUrl, exercise, {headers}).pipe(
      tap(() => {
        this.refreshNeeded$.next();
      })
    );
  }

  editExercise(id: number, newTitle: string, newDescription: string): Observable<any> {
    const body = { id, newTitle, newDescription };
    const token = localStorage.getItem('token');
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });
    return this.http.put<any>(this.apiUrlEdit, body, {headers}).pipe(
      tap(() => {
        this.refreshNeeded$.next();
      }),
      catchError(error => {
        console.error('Error editing exercise:', error);
        throw error;
      })
    );
  }

  deleteExercise(id: number): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.delete<any>(`${this.apiUrlDelete}${id}`, {headers}).pipe(
      tap(() => {
        this.refreshNeeded$.next();
      })
    );
  }

  onRefreshNeeded(): Observable<void> {
    return this.refreshNeeded$.asObservable();
  }
}
