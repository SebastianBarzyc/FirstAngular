// exercise.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ExerciseService {
  private apiUrl = 'http://localhost:3000/api/exercises';
  private apiUrlEdit = 'http://localhost:3000/api/update-exercise/';
  private apiUrlDelete = 'http://localhost:3000/api/delete-exercise/';
  private apiUrlSearch = 'http://localhost:3000/api/search-exercises/';
  private refreshNeeded$ = new Subject<void>();
  private searchResultsSubject = new BehaviorSubject<any[]>([]);
  searchResults$ = this.searchResultsSubject.asObservable();

  constructor(private http: HttpClient) {}

  getData(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  addExercise(exercise: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, exercise).pipe(
      tap(() => {
        this.refreshNeeded$.next();  // Trigger refresh after adding exercise
      })
    );
  }

  editExercise(id: number, newTitle: string, newDescription: string): Observable<any> {
    const body = { id, newTitle, newDescription };

    return this.http.put<any>(this.apiUrlEdit, body).pipe(
      tap(() => {
        this.refreshNeeded$.next();  // Trigger refresh after editing exercise
      }),
      catchError(error => {
        console.error('Error editing exercise:', error);
        throw error;
      })
    );
  }

  deleteExercise(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrlDelete}${id}`).pipe(
      tap(() => {
        this.refreshNeeded$.next();  // Trigger refresh after deleting exercise
      })
    );
  }

  searchExercise(query: string): Observable<any[]> {
    const params = new HttpParams().set('query', query);
    return this.http.get<any[]>(this.apiUrlSearch, { params }).pipe(
      tap(data => {
        console.log('Search results:', data);
        this.searchResultsSubject.next(data);  // Update search results
      })
    );
  }

  onRefreshNeeded(): Observable<void> {
    return this.refreshNeeded$.asObservable();
  }
}
