import { WorkoutService } from './../Workouts/workouts.service';
import { supabase, getUser } from '../supabase-client';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { ExerciseService } from '../Exercises/exercises.service';

interface Workout {
  id: number;
  title: string;
  description: string;
  exercises: Exercise[];
  duration?: number;
}

interface Exercise {
  id: number;
  title: string;
  sets: Sets[];
}

interface Sets {
  order: number;
  reps: number;
  weight: number;
  breakTime: number;
}

@Injectable({ providedIn: 'root' })
export class startWorkoutService {
  constructor(
    private WorkoutService: WorkoutService,
    private exercisesService: ExerciseService
  ) {}
  
  private workouts: Workout[] = [];

  workoutData(workoutId: number) {
    return new Observable<Workout>(observer => {
      supabase
        .from('plan_exercises')
        .select('plan_id, exercise_id, exercise_title, reps, breakTime, order')
        .eq('plan_id', workoutId)
        .order('order', { ascending: true })
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
                id: row.exercise_id,
                title: row.exercise_title,
                sets: []
              });
            }
            const exercise = exercisesMap.get(key)!;
            exercise.sets.push({ order: row.order, reps: row.reps, weight: row.weight || 0, breakTime: row.breakTime || 0});
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

  getExercises(): Observable<any[]> {
    return this.exercisesService.getData();
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
            .order('order', { ascending: true })
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
                    id: row.exercise_id,
                    title: row.exercise_title,
                    sets: []
                  });
                }
                const exercise = exercisesMap.get(key)!;
                exercise.sets.push({ order: row.order, reps: row.reps, weight: row.weight || 0, breakTime: row.breakTime || 0 });
              });
              sessionWorkout.exercises = Array.from(exercisesMap.values());
              observer.next(sessionWorkout);
              observer.complete();
            });
        });
      });
    }
    
  createNewWorkoutFromProgress(workout: any, finalProgress: any) {
    const exercises: any[] = [];
    let lastBreakTime = 0;
    console.log("finalProgress", finalProgress);
    finalProgress.progress.forEach((item: any) => {

      if (item.type === 'break') {
        lastBreakTime = item.breakTime ?? 60;
      }

      if (item.type === 'exercise') {
        exercises.push({
          id: item.exerciseId,
          title: item.exerciseTitle,
          sets: [
            {
              order: item.order,
              reps: item.reps ?? 0,
              weight: item.weight ?? 0,
              breakTime: lastBreakTime
            }
          ]
        });

        lastBreakTime = 0;
      }
    });

    return {
      id: workout.id,
      title: workout.title,
      description: workout.description,
      exercises: exercises
    };
  }
  async saveCompletedWorkout(workout: Workout): Promise<void> {
    const user = getUser();
    if (!user) throw new Error('Użytkownik nie jest zalogowany.');

    const { data, error } = await supabase
      .from('sessions')
      .insert([{
        date: new Date().toISOString().split('T')[0],
        title: workout.title,
        description: workout.description,
        user_id: user.id,
        duration: workout.duration
      }])
      .select();

    if (error) {
      console.error('Błąd podczas zapisywania sesji:', error);
      throw new Error('Nie udało się zapisać sesji.');
    }

    const sessionId = data[0].session_id;

    const { error: exercisesError } = await supabase
      .from('session_exercises')
      .insert(
        workout.exercises.flatMap(exercise =>
          exercise.sets.map(set => ({
            exercise_id: exercise.id,
            reps: set.reps,
            weight: set.weight,
            session_id: sessionId,
            user_id: user.id,
            exercise_title: exercise.title,
            breakTime: set.breakTime,
            order: set.order
          }))
        )
      );

    if (exercisesError) {
      console.error('Błąd podczas zapisywania ćwiczeń:', exercisesError);
      throw new Error('Nie udało się zapisać ćwiczeń.');
    }
  }
  getLastWeights(exerciseId: number) {
    return new Observable<any[]>(observer => {
      const run = async () => {
        const user = getUser();
        if (!user) {
          observer.error('Użytkownik nie jest zalogowany.');
          return;
        }

        const { data: lastSession, error } = await supabase
          .from('session_exercises')
          .select('session_id')
          .eq('user_id', user.id)
          .eq('exercise_id', exerciseId)
          .order('session_id', { ascending: false })
          .limit(1);

        if (!lastSession || lastSession.length === 0) {
          observer.next([]);
          observer.complete();
          return;
        }

        const sessionId = lastSession[0].session_id;

        const { data: lastSets } = await supabase
          .from('session_exercises')
          .select('*')
          .eq('session_id', sessionId)
          .eq('exercise_id', exerciseId)
          .order('order', { ascending: true });

        observer.next(lastSets || []);
        observer.complete();
      };

      run();
    });
  }
}