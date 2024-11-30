import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, Subject, tap } from 'rxjs';

interface Session {
  session_id: number,
  date: string,
  title: string,
  description: string,
}

@Injectable({
  providedIn: 'root'
})
export class CalendarService {

  private apiUrl = 'http://localhost:3000/api/sessions';
  private apiUrlEdit = 'http://localhost:3000/api/update-session/';
  private apiUrlDelete = 'http://localhost:3000/api/delete-session/';
  private apiUrlWorkouts = 'http://localhost:3000/api/workouts/';
  refreshNeeded$ = new Subject<void>();

  constructor(private http: HttpClient) {}

  getSessions(): Observable<Session[]> {
    return this.http.get<Session[]>(this.apiUrl);
  }

  getWorkouts(): Observable<any> {
    return this.http.get<any>(this.apiUrlWorkouts);
  }

  addSession(session: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, session).pipe(
      tap(() => {
        this.refreshNeeded$.next();
      })
    );
  }

  editSession(id: number, newTitle: string, newDescription: string): Observable<any> {
    const body = { id, newTitle, newDescription };
  
    return this.http.put<any>(this.apiUrlEdit, body).pipe(
      tap(() => {
        this.refreshNeeded$.next();
      }),
      catchError(error => {
        console.error('Error editing workout:', error);
        throw error;
      })
    );
  }

  deleteSession(id: number): Observable<any> {
      return this.http.delete<any>(`${this.apiUrlDelete}${id}`).pipe(
        tap(() => {
          this.refreshNeeded$.next();
        }),
        catchError(error => {
          console.error('Error deleting session:', error);
          throw error;
        })
      );
    }
  }
