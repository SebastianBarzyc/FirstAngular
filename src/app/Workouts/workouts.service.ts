import { Injectable } from "@angular/core";
import { catchError, Observable, Subject, tap } from "rxjs";
import { HttpClient} from '@angular/common/http';

@Injectable({
    providedIn: 'root'
  })
  export class WorkoutService { 
    constructor(private http: HttpClient) {}

    private apiUrl = 'http://localhost:3000/api/workouts';
    private apiUrlEdit = 'http://localhost:3000/api/update-workout/';
    private apiUrlDelete = 'http://localhost:3000/api/delete-workout/';
    private refreshNeeded$ = new Subject<void>();

    getData(): Observable<any> {
        return this.http.get<any>(this.apiUrl);
    }

    addworkout(workout: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, workout).pipe(
      tap(() => {
        this.refreshNeeded$.next();
      })
    );
  }

  onRefreshNeeded(): Observable<void> {
    return this.refreshNeeded$.asObservable();
  }

  editworkout(id: number, newTitle: string, newDescription: string): Observable<any> {
    const body = { id, newTitle, newDescription };

    return this.http.put<any>(this.apiUrlEdit, body).pipe(
        catchError(error => {
        console.error('Error editing workout:', error);
        throw error;
      })
    );
  }

  deleteworkout(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrlDelete}${id}`).pipe(
      tap(() => {
        this.refreshNeeded$.next();
      })
    );
  }
  }