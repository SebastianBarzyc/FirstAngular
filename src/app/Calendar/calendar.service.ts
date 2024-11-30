import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface Session {
  session_id: number,
  plan_id: number,
  date: string,
  title: string,
  description: string,
}

@Injectable({
  providedIn: 'root'
})
export class CalendarService {

  private apiUrl = 'http://localhost:3000/api/sessions';
  private apiUrlWorkouts = 'http://localhost:3000/api/workouts/';
  constructor(private http: HttpClient) { }

  getSessions(): Observable<Session[]> {
    return this.http.get<Session[]>(this.apiUrl);
  }

  getWorkouts(): Observable<any> {
    return this.http.get<any>(this.apiUrlWorkouts);
  }
}
