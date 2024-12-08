import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, Observable, of, Subject, tap } from 'rxjs';

interface Session {
  session_id: number,
  date: string,
  title: string,
  description: string,
}

interface Exercise {
  id: number;
  exercise_id: number;
  exercise_title: string;
  title: string;
  sets: Set[];
}

interface Set {
  reps: number;
  weight: number;
}

@Injectable({
  providedIn: 'root'
})
export class CalendarService {

  private apiUrl = 'http://localhost:3000/api/sessions';
  private apiUrlEdit = 'http://localhost:3000/api/update-session/';
  private apiUrlEdit2 = 'http://localhost:3000/api/update-session2/';
  private apiUrlEdit3 = 'http://localhost:3000/api/update-session3/';
  private apiUrlDelete = 'http://localhost:3000/api/delete-session/';
  private apiUrlWorkouts = 'http://localhost:3000/api/workouts/';
  private apiUrlExercises = 'http://localhost:3000/api/exercises';

  refreshNeeded$ = new Subject<void>();

  constructor(private http: HttpClient) {}

  getSessions(): Observable<Session[]> {
    const token = localStorage.getItem('token');
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });
    return this.http.get<Session[]>(this.apiUrl, {headers});
  }

  getWorkouts(): Observable<any> {
    const token = localStorage.getItem('token');
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });
    return this.http.get<any>(this.apiUrlWorkouts, {headers});
  }

  addSession(session: any): Observable<any> {
    const token = localStorage.getItem('token');
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });
    return this.http.post<any>(this.apiUrl, session, {headers}).pipe(
      tap(() => {
        this.refreshNeeded$.next();
      })
    );
  }

  editSession(id: number, newTitle: string, newDescription: string): Observable<any> {
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
        console.error('Error editing workout:', error);
        throw error;
      })
    );
  }

  editSession2(id: number): Observable<any> {
    const token = localStorage.getItem('token');
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });
    return this.http.delete<any>(`${this.apiUrlEdit2}${id}`, {headers}).pipe(
      tap(() => {
        this.refreshNeeded$.next();
      }),
      catchError(error => {
        console.error('Error editing Session:', error);
        throw error;
      })
    );
  }

  editSession3(exercise_id: number, exercise_title: string, reps: number, weight: number, session_id: number): Observable<any> {
    const url = this.apiUrlEdit3;
    const body = { 
      exercise_id: exercise_id,
      exercise_title: exercise_title,
      reps: reps,
      weight: weight,
      session_id: session_id
    };
    const token = localStorage.getItem('token');
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });
      
    return this.http.post<any>(url, body, {headers}).pipe(
      tap(() => {
        this.refreshNeeded$.next();
      }),
      catchError(this.handleError<any>('editworkout3'))
    );
  }

  deleteSession(id: number): Observable<any> {
    const token = localStorage.getItem('token');
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });
      return this.http.delete<any>(`${this.apiUrlDelete}${id}`, {headers}).pipe(
        tap(() => {
          this.refreshNeeded$.next();
        }),
        catchError(error => {
          console.error('Error deleting session:', error);
          throw error;
        })
      );
    }

  getExercises(): Observable<any> {
    const token = localStorage.getItem('token');
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });
    return this.http.get<any>(this.apiUrlExercises, {headers});
  }

  getExercisesList(id: number): Observable<Exercise[]> {
    const token = localStorage.getItem('token');
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });
    return this.http.get<Exercise[]>(`http://localhost:3000/api/session/${id}/exercises`, {headers});
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      return of(result as T);
    };
  }
}
