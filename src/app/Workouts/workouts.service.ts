import { EventEmitter, Injectable } from "@angular/core";
import { catchError, from, Observable, of, Subject, tap, throwError } from "rxjs";
import { HttpClient } from '@angular/common/http';
import { supabase, getUser } from '../supabase-client';


interface Workout {
  exercise_id: number;
  title: string;
  reps: number[];
}

interface InsertData {
  plan_id: number;
  exercise_id: number;
  reps: number;
  exercise_title: string;
  user_id: string;
}

interface PlanExercise {
  exercise_id: number;
  exercise_title: string;
  reps: number;
}

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
    refreshNeeded$ = new Subject<void>();

    public exerciseIdCounter = 0;
    public exerciseAllCounter = 0;
    exercisesList: any [] = [];
    exercises: any[] = []
    idFromTitle: number = 0;

    getData(): Observable<any> {
      const userId = getUser();
      if (!userId) {
        return throwError(() => new Error("Użytkownik nie jest zalogowany"));
      }

      return new Observable(observer => {
        const userId = getUser();
      
        if (!userId) {
          observer.error('Nie znaleziono identyfikatora użytkownika.');
          return;
        }
    
        const query = supabase
          .from('training_plans')
          .select('*')
          .eq('user_id', userId)
          .order('id', { ascending: true });
      
        query
          .then(({ data, error }) => {
            if (error) {
              observer.error('Błąd podczas pobierania danych: ' + error.message);
            } else {
              observer.next(data);
            }
          })
      });
    }
    
    onRefreshNeeded(): Observable<void> {
      return this.refreshNeeded$.asObservable();
    }

    addWorkout(workout: any): Observable<any> {
      return from(this.addWorkoutPromise(workout));
    }
    
    private async addWorkoutPromise(workout: any): Promise<any> {
      const userId = await getUser();
      if (!userId) {
        console.error('Brak zalogowanego użytkownika');
        throw new Error('Brak zalogowanego użytkownika');
      }
    
      const { data, error } = await supabase
        .from('training_plans')
        .insert([
          {
            title: workout.title,
            description: workout.description,
            user_id: userId,
          },
        ])
        .select('*');
    
      if (error) {
        console.error('Błąd podczas dodawania workout:', error);
        throw new Error('Failed to add workout');
      }
    
      console.log('Dodano nowy workout:', data);
      this.refreshNeeded$.next();
      return data;
    }

    addWorkout2(workouts: Workout[]): Observable<any> {
      console.log("addworkout2: ", workouts);
      return from(this.addWorkout2Promise(workouts));
    }
    
    private async addWorkout2Promise(workouts: Workout[]): Promise<any> {
      console.log("workouts1: ", workouts);
      const userId = await getUser();
      if (!userId) {
        console.error('Brak zalogowanego użytkownika');
        throw new Error('Brak zalogowanego użytkownika');
      }
    
      const { data: lastPlan, error: lastPlanError } = await supabase
        .from('training_plans')
        .select('id')
        .eq('user_id', userId)
        .order('id', { ascending: false })
        .limit(1)
        .single();
    
      if (lastPlanError) {
        console.error('Błąd Supabase (training_plans):', lastPlanError);
        throw new Error('Failed to fetch the last training plan');
      }
    
      if (!lastPlan) {
        throw new Error('No training plans found, cannot assign plan_id');
      }
      const plan_id = lastPlan.id;
    
      const validWorkouts = workouts.filter(workout => workout.exercise_id !== 0);
      console.log("workouts2: ", validWorkouts);
      console.log("workouts: ", workouts);

      if (validWorkouts.length === 0) {
        console.error('Brak prawidłowych ćwiczeń do zapisania.');
        throw new Error('Brak prawidłowych ćwiczeń do zapisania.');
      }
      
      const insertData: InsertData[] = validWorkouts.flatMap(({ exercise_id, title, reps }) => {
        return reps.map((rep: number) => ({
          plan_id,
          exercise_id,
          reps: rep,
          exercise_title: title,
          user_id: userId,
        }));
      });
      console.log("workouts3: ", insertData);

      const { data, error } = await supabase
        .from('plan_exercises')
        .insert(insertData)
        .select('*');
      
      if (error) {
        console.error('Błąd Supabase (plan_exercises):', error);
        throw new Error('Failed to add workouts');
      }
      
      console.log('Workout successfully added:', data);
    }    

    async getExerciseByTitle(title: string): Promise<any> {
      const userId = await getUser();
      if (!userId) {
        throw new Error('User not logged in');
      }
  
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .eq('title', title)
        .eq('user_id', userId)
        .single();
  
      if (error) {
        console.error('Error fetching exercise by title:', error);
        throw error;
      }
  
      return data;
    }

    editWorkout(id: number, newTitle: string, newDescription: string): Observable<any> {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('Brak tokenu');
        return of({ message: 'Brak tokenu' });
      }
  
      return new Observable(observer => {
        supabase
          .from('training_plans')
          .update({ title: newTitle, description: newDescription })
          .eq('id', id)
          .select('*')
          .then(({ data, error }) => {
            if (error) {
              observer.error('Error updating workout: ' + error.message);
              return;
            }
  
            if (data && data.length > 0) {
              observer.next({ message: 'Data has been updated', updatedWorkout: data[0] });
            } else {
              observer.error('Workout not found');
            }

            this.refreshNeeded$.next();
          })
      }).pipe(
        tap(response => {
          console.log('Workout updated:', response);
        }),
        catchError(error => {
          console.error('Error in edit workout service:', error);
          return of(error);
        })
      );
    }

  editworkout2(id: number): Observable<any> {
    return new Observable(observer => {
      supabase
        .from('plan_exercises')
        .delete()
        .eq('plan_id', id)
        .then(({ data, error }) => {
          if (error) {
            observer.error('Error deleting exercise: ' + error.message);
            return;
          }

          if (data) {
            supabase
              .from('training_plans')
              .delete()
              .eq('id', id)
              .then(({ data: planData, error: planError }) => {
                if (planError) {
                  observer.error('Error deleting from training_plans: ' + planError.message);
                  return;
                }

                if (planData) {
                  observer.next({ message: 'Workout deleted successfully' });
                } else {
                  observer.error('Workout not found');
                }
              })
          } else {
            observer.error('Exercise not found');
          }
        })
    }).pipe(
      catchError(this.handleError<any>('deleteWorkout'))
    );
  }

  editWorkout3(planId: number, idExercise: number, reps: number[], exercise_title: string, order: number): Observable<any> {
    return new Observable(observer => {
      Promise.resolve(getUser())
        .then(userId => {
          if (!userId) {
            observer.error('User is not logged in');
            observer.complete();
            return;
          }
  
          const exercises = reps.map(rep => ({
            plan_id: planId,
            exercise_id: idExercise,
            reps: rep,
            exercise_title,
            user_id: userId,
            order // Include the order to maintain the correct sequence
          }));
  
          supabase
            .from('plan_exercises')
            .upsert(exercises)
            .then(({ data, error }) => {
              if (error) {
                observer.error('Error updating workout: ' + error.message);
              } else {
                observer.next({ message: 'Workout updated successfully', data });
                observer.complete();
              }
            })
        })
        .catch(err => {
          observer.error('Error retrieving user: ' + err.message);
        });
    }).pipe(
      catchError(this.handleError<any>('editWorkout3'))
    );
  }
  
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      return of(result as T);
    };
  }

  deleteWorkout(id: number): Observable<any> {
    return new Observable(observer => {
      (async () => {
        try {
          const userId = await getUser();
          if (!userId) {
            observer.error('Brak zalogowanego użytkownika');
            observer.complete();
            return;
          }
  
          const { data: planExercisesData, error: planExercisesError } = await supabase
            .from('plan_exercises')
            .delete()
            .eq('plan_id', id);
  
          if (planExercisesError) {
            observer.error('Error deleting from plan_exercises: ' + planExercisesError.message);
            observer.complete();
            return;
          }
  
          const { data: trainingPlanData, error: trainingPlanError } = await supabase
            .from('training_plans')
            .delete()
            .eq('id', id);
  
          if (trainingPlanError) {
            observer.error('Error deleting workout: ' + trainingPlanError.message);
            observer.complete();
            return;
          }
  
          if (trainingPlanData) {
            this.refreshNeeded$.next();
            observer.next({ message: 'Workout deleted successfully' });
            observer.complete();
          } else {
            this.refreshNeeded$.next();
            observer.error('Workout not found1');
            observer.complete();
          }
  
        } catch (err) {
          observer.error('Unexpected error: ' + err);
          observer.complete();
        }
      })();
    }).pipe(
      tap(response => {
        console.log('Workout deleted:', response);
      }),
      catchError(error => {
        console.error('Error in delete workout service:', error);
        return of({ error: 'Failed to delete workout', details: error });
      })
    );
  }
  
  
  getExercisesForPlan(planId: number): Observable<any> {
    return new Observable(observer => {
      const userId = getUser();
      if (!userId) {
        observer.error('Brak zalogowanego użytkownika');
        return;
      }
  
      supabase
        .from('plan_exercises')
        .select('exercise_id, exercise_title, reps')
        .eq('plan_id', planId)
        .eq('user_id', userId)
        .order('order', { ascending: true })
        .then(({ data, error }: { data: PlanExercise[] | null; error: any }) => {
          if (error) {
            observer.error('Supabase error: ' + error.message);
          } else if (data) {
            const exercisesData = data.reduce((acc, row) => {
              const exerciseIndex = acc.findIndex(ex => ex.exercise_id === row.exercise_id);
              if (exerciseIndex !== -1) {
                acc[exerciseIndex].reps.push(row.reps);
              } else {
                acc.push({
                  exercise_id: row.exercise_id,
                  exercise_title: row.exercise_title,
                  sets: 1,
                  reps: [row.reps]
                });
              }
              return acc;
            }, [] as { exercise_id: number; exercise_title: string; sets: number; reps: number[] }[]);
  
            exercisesData.forEach(exercise => {
              exercise.sets = exercise.reps.length;
            });
  
            observer.next(exercisesData);
            observer.complete();
          } else {
            observer.error('No exercises found for this plan');
          }
        });
    }).pipe(
      tap(response => {
        console.log('Exercises for plan:', response);
      }),
      catchError(error => {
        console.error('Error in service:', error);
        return throwError(error);
      })
    );
  }  

  async addExerciseToWorkout(exercise: { title: string, reps: number[], exercise_id: number }) {
    try {
      const existingExerciseIndex = this.workoutExercises.findIndex(
        (e) => e.exercise_id === exercise.exercise_id
      );
      console.log("exerciseid: ", exercise.exercise_id);
      if (existingExerciseIndex !== -1) {
        this.workoutExercises[existingExerciseIndex].reps = exercise.reps;
      } else {
        this.workoutExercises.push({
          exercise_id: exercise.exercise_id,
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
