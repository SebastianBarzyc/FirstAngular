import { supabase, getUser } from '../supabase-client';
import { Observable } from 'rxjs';

interface Workout {
  id: number;
  title: string;
  description: string;
  exercises: Exercise[];
}

interface Exercise {
  title: string;
  sets: Sets[];
}

interface Sets {
  reps: number;
  //weight: number;
}

export class StartWorkoutService {
  constructor() {}

  private workouts: Workout[] = [];

  workoutData(workoutId: number) {
    console.log("Fetching workout data for workoutId:", workoutId);
    return new Observable<Workout>(observer => {
      supabase
        .from('plan_exercises')
        .select('plan_id, exercise_id, exercise_title, reps')
        .eq('plan_id', workoutId)
        .order('id', { ascending: true })
        .then(({ data: exercisesData, error: exError }) => {
          if (exError) {
            console.error('Błąd podczas pobierania ćwiczeń dla planów treningowych:', exError);
            observer.error('Wystąpił błąd podczas pobierania ćwiczeń dla planów treningowych.');
            observer.complete();
            return;
          }

          // Build a map of exercises for this plan, merging duplicate exercises
          // and appending sets when the same exercise appears multiple times.
          const exercisesMap = new Map<string, Exercise>();
          (exercisesData || []).forEach((row: any) => {
            // only process rows for the requested plan
            if (row.plan_id !== workoutId) return;
            const key = String(row.exercise_id ?? row.exercise_title);
            if (!exercisesMap.has(key)) {
              exercisesMap.set(key, {
                title: row.exercise_title,
                sets: []
              });
            }
            const exercise = exercisesMap.get(key)!;
            exercise.sets.push({ reps: row.reps });
          });

          const selectedWorkout = this.workouts.find(w => w.id === workoutId);
          if (selectedWorkout) {
            selectedWorkout.exercises = Array.from(exercisesMap.values());
            observer.next(selectedWorkout);
          } else {
            observer.error('Trening nie znaleziony');
          }
          observer.complete();
        });
      });
    }
  
  getWorkouts(): Observable<Workout[]> {
    return new Observable<Workout[]>(observer => {
      const user = getUser();
      if (!user) {
        observer.error('Użytkownik nie jest zalogowany.');
        return;
      }
      supabase
        .from('training_plans')
        .select('id, title, description')
        .eq('user_id', user.id)
        .order('id', { ascending: true })
        .then(({ data, error }) => {
          if (error) {
            console.error('Błąd podczas pobierania planów treningowych:', error);
            observer.error('Wystąpił błąd podczas pobierania planów treningowych.');
            observer.complete();
            return;
          }
          this.workouts = (data as Workout[]) || [];
          observer.next(this.workouts);
          observer.complete();
        });
    });
  }
}