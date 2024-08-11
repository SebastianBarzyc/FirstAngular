import { Injectable } from "@angular/core";
import { catchError, Observable, Subject, tap, throwError } from "rxjs";
import { HttpClient} from '@angular/common/http';

  export interface WorkoutExercise {
    [x: string]: any;
    id: string;
    title: string;
    sets: string;
    reps: string;
  };

  interface WorkoutResponse {
    data: any[];
  }

  @Injectable({
    providedIn: 'root'
  })
  export class WorkoutService {
    public workoutExercises: WorkoutExercise = {
      id: '',
      title: '',
      sets: '',
      reps: ''
    };
    
    constructor(private http: HttpClient) {}

    private apiUrl = 'http://localhost:3000/api/workouts/';
    private apiUrl2 = 'http://localhost:3000/api/workouts2/';
    private apiUrlExercise = 'http://localhost:3000/api/exercises';
    private apiUrlEdit = 'http://localhost:3000/api/update-workout/';
    private apiUrlDelete = 'http://localhost:3000/api/delete-workout/';
    private refreshNeeded$ = new Subject<void>();

    public exerciseIdCounter = 0;
    public exerciseAllCounter = 0;

    getData(): Observable<WorkoutResponse> {
      return this.http.get<WorkoutResponse>(this.apiUrl);
    }

    onRefreshNeeded(): Observable<void> {
      return this.refreshNeeded$.asObservable();
    }

    addworkout(workout: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, workout).pipe(
      tap(() => {
        this.refreshNeeded$.next();
      })
    );
    }
    addworkout2(workout: any): Observable<any> {
      return this.http.post<any>(this.apiUrl2, workout).pipe(
        tap(() => {
          this.refreshNeeded$.next();
        })
      );
      }

    getExerciseByTitle(title: string): Observable<any> {
      return this.http.get<any>(`${this.apiUrlExercise}/${title}`).pipe(
        tap(response => {
          const idFromTitle = response.exercise.id;
          this.refreshNeeded$.next();
        }),
        catchError(error => {
          console.error('Error in service:', error);
          return throwError(error);
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
