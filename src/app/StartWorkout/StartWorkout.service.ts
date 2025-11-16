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
  weight: number;
  breakTime: number;
}

export class startWorkoutService {
  constructor() {}

  private workouts: Workout[] = [];

  workoutData(workoutId: number) {
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

          const exercisesMap = new Map<string, Exercise>();
          (exercisesData || []).forEach((row: any) => {
            if (row.plan_id !== workoutId) return;
            const key = String(row.exercise_id ?? row.exercise_title);
            if (!exercisesMap.has(key)) {
              exercisesMap.set(key, {
                title: row.exercise_title,
                sets: []
              });
            }
            const exercise = exercisesMap.get(key)!;
            exercise.sets.push({ reps: row.reps, weight: row.weight || 0, breakTime: row.breakTime || 0});
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

  todayWorkout(): Observable<Workout> {
    return new Observable<Workout>(observer => {
      const user = getUser();
      if (!user) {
        observer.error('Użytkownik nie jest zalogowany.');
        return;
      }
      supabase
        .from('sessions')
        .select('session_id, title, description')
        .eq('user_id', user.id)
        .eq('date', new Date().toISOString().split('T')[0])
        .order('session_id', { ascending: true })
        .then(({ data, error }) => {
          if (error) {
            console.error('Błąd podczas pobierania sesji treningowej:', error);
            observer.error('Wystąpił błąd podczas pobierania sesji treningowej.');
            observer.complete();
            return;
          }
          if (!data || data.length === 0) {
            observer.error('Brak sesji treningowej na dzisiaj.');
            observer.complete();
            return;
          }
          const sessionData = data[0];
          const sessionWorkout: Workout = {
            id: sessionData.session_id,
            title: sessionData.title,
            description: sessionData.description,
            exercises: []
          };

          supabase
            .from('session_exercises')
            .select('exercise_id, exercise_title, reps, weight, breakTime')
            .eq('session_id', sessionData.session_id)
            .order('id', { ascending: true })
            .then(({ data: exercisesData, error: exError }) => {
              if (exError) {
                console.error('Błąd podczas pobierania ćwiczeń sesji:', exError);
                observer.error('Wystąpił błąd podczas pobierania ćwiczeń sesji.');
                observer.complete();
                return;
              }
              const exercisesMap = new Map<string, Exercise>();
              (exercisesData || []).forEach((row: any) => {
                const key = String(row.exercise_id);
                if (!exercisesMap.has(key)) {
                  exercisesMap.set(key, {
                    title: row.exercise_title,
                    sets: []
                  });
                }
                const exercise = exercisesMap.get(key)!;
                exercise.sets.push({ reps: row.reps, weight: row.weight || 0, breakTime: row.breakTime || 0 });
              });
              sessionWorkout.exercises = Array.from(exercisesMap.values());
              observer.next(sessionWorkout);
              observer.complete();
            });
        });
      });
    }
  }