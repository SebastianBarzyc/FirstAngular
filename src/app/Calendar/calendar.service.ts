import { Injectable } from '@angular/core';
import { catchError, from, map, firstValueFrom, Observable, Subject, throwError} from 'rxjs';
import { supabase, getUser } from '../supabase-client';


interface Exercise {
  exercise_id: number;
  exercise_title: string;
  sets: Set[];
  order: number;
}

interface Set {
  reps: number;
  weight: number;
  breakTime?: number;
}

@Injectable({
  providedIn: 'root'
})
export class CalendarService {
  refreshNeeded$ = new Subject<void>();
  user: any = null;

  constructor() {
    this.user = getUser();
  }

  triggerRefresh(): void {
    this.refreshNeeded$.next();
  }

//Observables

  getSessions(): Observable<any[]> {
    return from(
      supabase
        .from('sessions')
        .select('session_id, date, title, description, Advanced_group')
        .eq('user_id', this.user.id)
        .order('session_id', { ascending: true })
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data || [];
      }),
      catchError(error => {
        console.error("Error fetching sessions:", error);
        return throwError(() => new Error("Wystąpił błąd podczas pobierania sesji."));
      })
    );
  }

  getWorkouts(): Observable<any[]> {
    return from(
      supabase
        .from('training_plans')
        .select('*')
        .eq('user_id', this.user.id)
        .order('id', { ascending: true })
    ).pipe(
      map(({ data }) => data || []),
      catchError(error => {
        console.error("Error fetching workouts:", error);
        return throwError(() => "Wystąpił błąd podczas pobierania planów treningowych.");
      })
    );
  }

  getExercises(): Observable<any> {
    return from(
      supabase
        .from('exercises')
        .select('*')
        .eq('user_id', this.user.id && '5d3ab3e6-e980-4df6-af92-e0063728a5fc')
        .order('id', { ascending: true })
    ).pipe(
      map(({ data }) => data || []),
      catchError(error => {
        console.error("Error fetching exercises:", error);
        return throwError(() => "Wystąpił błąd podczas pobierania ćwiczeń.");
      })
    );
  }

  getExercisesList(sessionId: number): Observable<Exercise[]> {
    if (!sessionId) {
      return throwError(() => new Error(`Invalid sessionId: ${sessionId}`));
    }

    return from(
      supabase
        .from('session_exercises')
        .select('exercise_id, exercise_title, reps, weight, order, breakTime')
        .eq('session_id', sessionId)
        .order('order', { ascending: true })
    ).pipe(
      map(({ data, error }) => {
        console.log('Zapytanie wyniki getexerciseslist:', { data, error });

        if (error) {
          console.error('Supabase error:', error, "sessionId:", sessionId);
          throw new Error('Error fetching exercises for session');
        }

        if (!data || data.length === 0) {
          console.warn('Brak ćwiczeń dla sesji:', sessionId);
          return [];
        }

        const exercisesMap: { [key: number]: Exercise } = {};

        data.forEach(item => {
          if (!item.exercise_id || !item.exercise_title) {
            console.warn('Niepoprawny rekord ćwiczenia:', item);
            return;
          }

          if (!exercisesMap[item.exercise_id]) {
            exercisesMap[item.exercise_id] = {
              exercise_id: item.exercise_id,
              exercise_title: item.exercise_title,
              sets: [],
              order: item.order || 0
            };
          }

          exercisesMap[item.exercise_id].sets.push({
            reps: item.reps || 0,
            weight: item.weight || 0,
            breakTime: item.breakTime || 0
          });
        });

        const sortedExercises = Object.values(exercisesMap).sort((a, b) => a.order - b.order);
        console.log('Zapytanie wyniki getexerciseslist2:', { sortedExercises });
        return sortedExercises;
      }),
      catchError(err => {
        console.error("Błąd w getExercisesList:", err);
        return throwError(() => new Error("Error fetching exercises"));
      })
    );
  }

  getAdvancedGroups(): Observable<string[]> {
    return from(
      supabase
        .from('sessions')
        .select('Advanced_group')
        .eq('user_id', this.user.id)
        .not('Advanced_group', 'is', null)
    ).pipe (
      map(({ data, error }) => {
          if (error) {
            console.error('Error fetching Advanced_group values:', error);
            return [];
          }
  
          console.log('Fetched Advanced_group values:', data);
  
          if (data) {
            const uniqueGroups = Array.from(
              new Set(data.map((row) => row.Advanced_group))
            );
            return uniqueGroups;
          } else {
            return [];
          }
        })
    );
  }

//Promises

  async addSession(session: { date: string; title: string; description: string, session_id: number }): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('sessions')
        .insert({
          date: session.date,
          title: session.title,
          description: session.description,
          user_id: this.user.id,
          session_id: session.session_id
        })
        .select('*')
        .single();

      if (error) {
        console.error('Błąd Supabase:', error);
        throw error;
      }

      return { message: 'Sesja dodana pomyślnie', session: data };
    } catch (error) {
      console.error('Nieoczekiwany błąd:', error);
      throw error;
    }
  }

  async cleanAdvancedGroupSessions(): Promise<any> {
    const today = this.getDate(new Date());
    try {
      const { data, error } = await supabase
        .from('sessions')
        .select('session_id, date, Advanced_group')
        .eq('user_id', this.user.id)
        .lt('date', today);
  
      if (error) {
        console.error('Error fetching sessions:', error.message);
        return;
      }
      console.log("CLEARING: ", data, ", day ", today);

      const sessionsToUpdate = data.filter(session => session.Advanced_group !== null);
  
      for (const session of sessionsToUpdate) {
        const { error: updateError } = await supabase
          .from('sessions')
          .update({ Advanced_group: null })
          .eq('session_id', session.session_id);
  
        if (updateError) {
          console.error(`Error updating session ${session.session_id}:`, updateError.message);
        } else {
          console.log(`Session ${session.session_id} updated successfully.`);
        }
      }
    } catch (error) {
      console.error('Unexpected error during session cleanup:', error);
    }
  }

  async editSession(id: number, newTitle: string, newDescription: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('sessions')
        .update({ title: newTitle, description: newDescription })
        .eq('session_id', id)
        .select('*')
        if (error) {
          console.error('Błąd edytowania sesji:', error);
        }else {
          return data;
        }
    }catch (error) {
      console.error('Nieoczekiwany błąd podczas edytowania sesji:', error);
      throw error;
    }
  }
  
  async editSession3(exercises: any[], session_id: number): Promise<any> {
    try {
      const { error: deleteError } = await supabase
        .from('session_exercises')
        .delete()
        .eq('session_id', session_id)
        if (deleteError) {
          console.error('Error deleting existing exercises:', deleteError.message);
        }else {
          console.log('Deleted existing exercises for session_id:', session_id);

          const exercisesData = exercises.flatMap((exercise, index) => 
            exercise.sets.map((set: Set) => ({
              session_id: session_id,
              user_id: this.user.id,
              exercise_id: exercise.exercise_id || 0,
              exercise_title: exercise.exercise_title || 'Unknown',
              reps: Number(set.reps) || 0,
              weight: Number(set.weight) || 0,
              breakTime: Number(set.breakTime) || 0,
              order: index
            }))
          );
  
          console.log('Prepared exercises for insertion:', exercisesData);
            const { data: insertData, error: insertError } = await supabase
              .from('session_exercises')
              .insert(exercisesData)
              .select('*')
              if (insertError) {
                console.error('Error inserting new exercises:', insertError.message);
                return;
              }
              console.log('Inserted exercises:', insertData);
              return insertData;
        } 
    }catch (deleteError) {
      console.error('Unexpected error during editing session exercises:', deleteError);
      throw deleteError;
    }
  }

  async deleteSession(id: number): Promise<{ message: string }> {
    try {
      const { error: sessionExercisesError } = await supabase
        .from('session_exercises')
        .delete()
        .eq('session_id', id);

      if (sessionExercisesError) {
        console.error('Error deleting from session_exercises:', sessionExercisesError);
        return { message: 'Failed to delete session exercises' };
      }

      const { error: sessionError } = await supabase
        .from('sessions')
        .delete()
        .eq('session_id', id);

      if (sessionError) {
        console.error('Error deleting from sessions:', sessionError);
        return { message: 'Failed to delete session' };
      }

      console.log('Session deleted successfully');
      return { message: 'Session deleted successfully' };

    } catch (error) {
      console.error('Unexpected error during session deletion:', error);
      throw error;
    }
  }

  async saveSessionAndExercises(
    title: string,
    days: string[],
    exercises: any[],
    group: string
  ): Promise<void> {
    try {
      const maxIdSession = await firstValueFrom(this.getMaxSessionId());

      for (const [index, day] of days.entries()) {
        const formattedDate = this.convertDateToDatabaseFormat(day);
        const { data: sessionData, error: sessionError } = await supabase
          .from('sessions')
          .insert({
            session_id: maxIdSession + index + 1,
            user_id: this.user.id,
            title: title,
            date: formattedDate,
            description: `Advanced group: ${group}`,
            Advanced_group: group,
          })
          .select('*')
          .single();
  
        if (sessionError) {
          console.error('Error inserting session:', sessionError.message);
          return;
        }
  
        if (!sessionData || !sessionData.session_id) {
          console.error('Session data is invalid or missing:', sessionData);
          return;
        }
  
        console.log('Session data:', sessionData);
        console.log('Exercises to insert:', exercises);
        const exercisesToInsert = exercises.flatMap((exercise) => 
          exercise.sets.map((set: Set) => ({
          session_id: sessionData.session_id,
          user_id: this.user.id,
          exercise_id: exercise.exercise_id,
          exercise_title: exercise.exercise_title,
          reps: set.reps || 0,
          weight: set.weight || 0,
          order: exercise.order || 0,
          breakTime: set.breakTime || 0,
        })));
  
        if (exercisesToInsert.length > 0) {
          const { error: exercisesError } = await supabase
            .from('session_exercises')
            .insert(exercisesToInsert);
            
          if (exercisesError) {
            console.error('Error inserting into session_exercises:', exercisesError.message);
            return;
          } else {
            console.log('Inserted exercises for session:', sessionData.session_id);
          }
        } else {
          console.log('No exercises to insert for session:', sessionData.session_id);
        }
      }
  
      console.log('All changes saved successfully.');
    } catch (error) {
      console.error('Unexpected error during saving session and exercises:', error);
      throw error;
    }
  }

  async deleteAdvancedGroup(group: string): Promise<void> {
    try {
      const { data: sessions, error: fetchError } = await supabase
        .from('sessions')
        .select('session_id')
        .eq('user_id', this.user.id)
        .eq('Advanced_group', group);
  
      if (fetchError) {
        console.error('Error fetching sessions for advanced group:', fetchError.message);
        return;
      }
  
      if (!sessions || sessions.length === 0) {
        console.warn('No sessions found for the advanced group:', group);
        return;
      }
  
      const sessionIds = sessions.map((session) => session.session_id);
      const { error: deleteExercisesError } = await supabase
        .from('session_exercises')
        .delete()
        .in('session_id', sessionIds);
  
      if (deleteExercisesError) {
        console.error('Error deleting exercises for advanced group:', deleteExercisesError.message);
        return;
      }
  
      const { error: deleteSessionsError } = await supabase
        .from('sessions')
        .delete()
        .in('session_id', sessionIds);
  
      if (deleteSessionsError) {
        console.error('Error deleting sessions for advanced group:', deleteSessionsError.message);
        return;
      }
  
      console.log('Advanced group deleted successfully:', group);
    } catch (error) {
      console.error('Error deleting advanced group:', error);
    }
  }

  //Other methods

  getDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  convertDateToDatabaseFormat(date: string): string {
    const [day, month, year] = date.split('.');
    return `${year}-${month}-${day}`;
  }

  getMaxSessionId(): Observable<number> {
    return this.getSessions().pipe(
      map(sessions => {
        if (sessions.length === 0) return 0;
        return Math.max(...sessions.map(s => s.session_id));
      })
    );
  }

}
