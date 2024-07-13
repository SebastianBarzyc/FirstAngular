import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  getData(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/data`);
  }

  submitData(title: string, description: string): Observable<any> {
    const body = { title, description };
    return this.http.post<any>(`${this.apiUrl}/submit`, body);
  }
}
