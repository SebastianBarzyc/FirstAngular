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

  private workoutPlanSource = new BehaviorSubject<Array<{ exercise: string, sets: number, reps: number }>>([]);
  currentWorkoutPlan = this.workoutPlanSource.asObservable();

  private selectedExerciseSource = new BehaviorSubject<string>('');
  currentSelectedExercise = this.selectedExerciseSource.asObservable();

  updateWorkoutPlan(workoutPlan: Array<{ exercise: string, sets: number, reps: number }>) {
    this.workoutPlanSource.next(workoutPlan);
  }

  updateSelectedExercise(selectedExercise: string) {
    this.selectedExerciseSource.next(selectedExercise);
  }

  getId() {
    return this.exerciseIdCounter;
  }

  setId(value: any) {
    this.exerciseIdCounter = value;
  }

  private exercisesSubject = new BehaviorSubject<{ title: string, sets: number, reps: number }[]>([]);
  exercises$ = this.exercisesSubject.asObservable();

  addExercise(exercise: { title: string, sets: number, reps: number }) {
    const currentExercises = this.exercisesSubject.value;
    const newExercise = {
      ...exercise,
    };
    this.exercisesSubject.next([...currentExercises, newExercise]);
    console.log("New exercise added:", newExercise);
  }
}