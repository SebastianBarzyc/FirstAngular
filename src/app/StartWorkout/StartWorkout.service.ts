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
                exercise.sets.push({ reps: row.reps, weight: row.weight || 0, breakTime: row.breakTime || 0 });
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

  finalProgress.progress.forEach((item: any, index: number) => {
    if (item.type === 'exercise') {
      
      const next = finalProgress.progress[index + 1];
      const breakTime =
        next && next.type === 'break'
          ? next.reps ?? 0
          : 0;

      exercises.push({
        id: item.exerciseId,
        title: item.exerciseTitle,
        sets: [
          {
            reps: item.reps ?? 0,
            weight: item.weight ?? 0,
            breakTime: breakTime
          }
        ]
      });
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

    const { data} = await supabase
      .from('sessions')
      .select('session_id')
      .eq('user_id', user.id)
      .eq('date', new Date().toISOString().split('T')[0]);
    if (data && data.length > 0) {
      console.log('Dzisiaj był trening, usuwam: ', data);
      const sessionId: number = data[0].session_id;
      const {} = await supabase
        .from('session_exercises')
        .delete()
        .eq('session_id', sessionId)
        .eq('user_id', user.id);
    }else{
      const { error } = await supabase
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
    }

    const sessionId = data![0].session_id;
    console.log("workout.exercises", workout.exercises);
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
            order: workout.exercises.indexOf(exercise)
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

        const today = new Date().toISOString().split('T')[0];

        const { data: sessionEx, error: err1 } = await supabase
          .from('session_exercises')
          .select('session_id')
          .eq('user_id', user.id)
          .eq('exercise_id', exerciseId);

        if (err1) {
          observer.error(err1);
          return;
        }

        if (!sessionEx || sessionEx.length === 0) {
          observer.next([]);
          observer.complete();
          return;
        }

        const sessionIds = sessionEx.map(s => s.session_id);

        const { data: sessions, error: err2 } = await supabase
          .from('sessions')
          .select('session_id, date')
          .in('session_id', sessionIds);

        if (err2) {
          observer.error(err2);
          return;
        }

        if (!sessions || sessions.length === 0) {
          observer.next([]);
          observer.complete();
          return;
        }

        const filtered = sessions
          .filter(s => s.date && s.date <= today)
          .sort((a, b) => b.date.localeCompare(a.date));

        if (filtered.length === 0) {
          observer.next([]);
          observer.complete();
          return;
        }

        const lastSessionId = filtered[0].session_id;

        const { data: lastSets, error: err3 } = await supabase
          .from('session_exercises')
          .select('*')
          .eq('session_id', lastSessionId)
          .eq('exercise_id', exerciseId)
          .order('order', { ascending: true });

        if (err3) {
          observer.error(err3);
          return;
        }

        observer.next(lastSets || []);
        observer.complete();
      };

      run();
    });
  }
}