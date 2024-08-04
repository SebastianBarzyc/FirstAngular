import { workoutEditComponent } from './workouts-edit.component';
import { Injectable } from "@angular/core";
import { BehaviorSubject, catchError, Observable, Subject, tap } from "rxjs";
import { HttpClient} from '@angular/common/http';
import { WorkoutsBackend } from './workouts-backend.component';

@Injectable({
    providedIn: 'root'
  })
  export class WorkoutService {
    constructor(private http: HttpClient) {}

    private apiUrl = 'http://localhost:3000/api/workouts';
    private apiUrlEdit = 'http://localhost:3000/api/update-workout/';
    private apiUrlDelete = 'http://localhost:3000/api/delete-workout/';
    private refreshNeeded$ = new Subject<void>();

    public exerciseIdCounter = 0;
    public exerciseAllCounter = 0;

    public workoutExercises = [];
      
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

  getId() {
    return this.exerciseIdCounter;
  }
  setId(value: any) {
    this.exerciseIdCounter = value;
  }
  getCounter() {
    return this.exerciseAllCounter;
  }
  setCounter(value: any) {
    this.exerciseAllCounter = value;
  }

  getWorkoutExercises(){
    return this.workoutExercises;
  }
  setWorkoutExercises(value: any){
    this.workoutExercises = value;
  }
}