import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { HttpClient} from '@angular/common/http';

@Injectable({
    providedIn: 'root'
  })
  export class WorkoutService { 
    constructor(private http: HttpClient) {}

    private apiUrl = 'http://localhost:3000/api/workouts';

    getData(): Observable<any> {
        return this.http.get<any>(this.apiUrl);
      }
  }