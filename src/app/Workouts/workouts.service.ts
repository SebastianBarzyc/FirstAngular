import { EventEmitter, Injectable } from "@angular/core";
import { catchError, Observable, of, Subject, tap, throwError } from "rxjs";
import { HttpClient, HttpHeaders} from '@angular/common/http';

  export interface WorkoutExercise {
    exercise_id: number;
    reps: number[];
    title: string;
  };

  @Injectable({
    providedIn: 'root'
  })
  export class WorkoutService {
    workoutChanged = new EventEmitter<void>();
    workoutExercises: WorkoutExercise[] = [];

    
    constructor(private http: HttpClient) {}

    private apiUrl = 'http://localhost:3000/api/workouts';
    private apiUrl2 = 'http://localhost:3000/api/workouts2/';
    private apiUrlExercise = 'http://localhost:3000/api/exercises';
    private apiUrlExercise2 = 'http://localhost:3000/api/exercises2';
    private apiUrlEdit = 'http://localhost:3000/api/update-workout/';
    private apiUrlEdit2 = 'http://localhost:3000/api/update-workout2/';
    private apiUrlEdit3 = 'http://localhost:3000/api/update-workout3/';
    private apiUrlDelete = 'http://localhost:3000/api/delete-workout/';
    refreshNeeded$ = new Subject<void>();

    public exerciseIdCounter = 0;
    public exerciseAllCounter = 0;
    exercisesList: any [] = [];
    exercises: any[] = []
    idFromTitle: number = 0;

    getData(): Observable<any> {
      return this.http.get<any>(this.apiUrl);
    }
    getExercises(id: number): Observable<any> {
      const url = `${this.apiUrlExercise2}/${id}`;
      return this.http.get<any>(url);
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
      console.log("service: ", workout);
      return this.http.post<any>(this.apiUrl2, workout).pipe(
        tap(() => {
          this.refreshNeeded$.next();
        })
      );
      }

    getExerciseByTitle(title: string): Observable<any> {
      return this.http.get<any>(`${this.apiUrlExercise}/${title}`).pipe(
        tap(response => {
          this.idFromTitle = response.exercise.id;
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
      console.log(body);
    
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

  editworkout2(id: number): Observable<any> {
    console.log("editworkout2: " + id);
    return this.http.delete<any>(`${this.apiUrlEdit2}${id}`).pipe(
      catchError(error => {
        console.error('Error editing workout:', error);
        throw error;
      })
    );
  }

  editworkout3(planId: number, idExercise: number, reps: number[], exercise_title: string): Observable<any> {
    console.log('editworkout3 called with:', { planId, idExercise, reps, exercise_title });
    const url = this.apiUrlEdit3;

    // Przygotowanie ciała zapytania, gdzie każdy rep to osobny element
    const body = reps.map(rep => ({
        planId: planId,
        idExercise: idExercise,
        reps: rep,
        exercise_title: exercise_title,
    }));

    console.log('Sending data to server:', body);

    return this.http.post<any>(url, body, {
        headers: new HttpHeaders({
            'Content-Type': 'application/json'
        })
    }).pipe(
        catchError(this.handleError<any>('editworkout3'))
    );
}

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      return of(result as T);
    };
  }

  deleteworkout(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrlDelete}${id}`).pipe(
      tap(() => {
        this.refreshNeeded$.next();
      }),
      catchError(error => {
        console.error('Error deleting workout:', error);
        throw error;
      })
    );
  }

  getExercisesForPlan(planId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${planId}/exercises`);
  }
   
  getAvailableExercises(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/available-exercises`);
  }

  async addExerciseToWorkout(exercise: { title: string, reps: number[] }) {
    try {
      await this.getExerciseByTitle(exercise.title).toPromise(); 
      const exerciseId = this.idFromTitle;
      const existingExerciseIndex = this.workoutExercises.findIndex(
        (e) => e.exercise_id === exerciseId
      );
  
      if (existingExerciseIndex !== -1) {
        this.workoutExercises[existingExerciseIndex].reps = exercise.reps;
      } else {
        this.workoutExercises.push({
          exercise_id: exerciseId,
          reps: exercise.reps,
          title: exercise.title,
        });
        console.log("Added new exercise:", this.workoutExercises);
      }
    } catch (error) {
      console.error('Error adding exercise to workout:', error);
    }
  }  

  getWorkoutExercises(){
    return this.workoutExercises;
  }
}
