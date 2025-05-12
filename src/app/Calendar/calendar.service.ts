import { Injectable } from '@angular/core';
import { HttpClient, } from '@angular/common/http';
import { Observable, Subject} from 'rxjs';
import { supabase, getUser } from '../supabase-client';


interface Exercise {
  id: number;
  exercise_id: number;
  exercise_title: string;
  title: string;
  sets: Set[];
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

  constructor(private http: HttpClient) {}

  triggerRefresh(): void {
    this.refreshNeeded$.next();
  }

  getSessions(): Observable<any[]> {
    return new Observable(observer => {
      const user = getUser();
      if (!user) {
        observer.error('Użytkownik nie jest zalogowany.');
        return;
      }

      supabase
        .from('sessions')
        .select('session_id, date, title, description, Advanced_group') // Ensure session_id is included
        .eq('user_id', user.id)
        .order('session_id', { ascending: true })
        .then(({ data, error }) => {
          if (error) {
            console.error('Błąd podczas pobierania sesji:', error);
            observer.error('Wystąpił błąd podczas pobierania sesji.');
          } else {
            observer.next(data || []);
          }
          observer.complete();
        })
    });
  }

  getWorkouts(): Observable<any[]> {
    return new Observable((observer) => {
      const id = getUser();
  
      if (!id) {
        observer.error('Użytkownik nie jest zalogowany.');
        return;
      }
  
      supabase
        .from('training_plans')
        .select('*')
        .eq('user_id', id)
        .order('id', { ascending: true })
        .then(({ data, error }) => {
          if (error) {
            console.error('Błąd Supabase:', error);
            observer.error('Wystąpił błąd podczas pobierania planów treningowych.');
          } else {
            observer.next(data || []);
          }
          observer.complete();
        })
    });
  }  

  addSession(session: { date: string; title: string; description: string }): Observable<any> {
    return new Observable((observer) => {
      const id = getUser();

      if (!id) {
        observer.error('Użytkownik nie jest zalogowany.');
        return;
      }

      supabase
        .from('sessions')
        .insert({
          date: session.date,
          title: session.title,
          description: session.description,
          user_id: id,
        })
        .select('*')
        .then(({ data, error }) => {
          if (error) {
            console.error('Błąd Supabase:', error);
            observer.error('Wystąpił błąd podczas dodawania sesji.');
          } else {
            observer.next({ message: 'Sesja dodana pomyślnie', session: data[0] });
          }
          observer.complete();
        })
    });
  }

  editSession(id: number, newTitle: string, newDescription: string): Observable<any> {
    return new Observable(observer => {
      supabase
        .from('sessions')
        .update({ title: newTitle, description: newDescription })
        .eq('session_id', id)
        .select('*')
        .then(({ data, error }) => {
          if (error) {
            console.error('Błąd edytowania sesji:', error);
            observer.error('Błąd edytowania sesji: ' + error.message);
          } else {
            if (data) {
              observer.next(data);
              observer.complete();
            } else {
              observer.error('No data returned after update');
            }
          }
        })
    });
  }
  
  editSession3(exercises: any[], session_id: number): Observable<any> {
    const userId = getUser();
    if (!userId) {
      console.error('User ID is missing');
      return new Observable(observer => {
        observer.error('User ID is missing');
      });
    }
  
    return new Observable(observer => {
      supabase
        .from('session_exercises')
        .delete()
        .eq('session_id', session_id)
        .then(({ error: deleteError }) => {
          if (deleteError) {
            console.error('Error deleting existing exercises:', deleteError.message);
            observer.error('Error deleting existing exercises: ' + deleteError.message);
            return;
          }
  
          console.log('Deleted existing exercises for session_id:', session_id); // Debug log
  
          const exercisesData = exercises.flatMap((exercise, index) => 
            exercise.sets.map((set: Set) => ({
              session_id: session_id, // Ensure session_id is assigned
              user_id: userId,       // Ensure user_id is assigned
              exercise_id: exercise.exercise_id || 0, // Fallback to 0 if undefined
              exercise_title: exercise.exercise_title || 'Unknown', // Fallback to 'Unknown' if undefined
              reps: Number(set.reps) || 0, // Ensure reps is a valid number
              weight: Number(set.weight) || 0, // Ensure weight is a valid number
              breakTime: Number(set.breakTime) || 60, // Ensure breakTime is a valid number
              order: index
            }))
          );
  
          console.log('Prepared exercises for insertion:', exercisesData); // Debug log
  
          supabase
            .from('session_exercises')
            .insert(exercisesData)
            .select('*')
            .then(({ data, error }) => {
              if (error) {
                console.error('Error inserting new exercises:', error.message);
                observer.error('Error inserting new exercises: ' + error.message);
                return;
              }
  
              console.log('Inserted exercises:', data); // Debug log
              observer.next(data);
              observer.complete();
            });
        });
    });
  }  

  deleteSession(id: number): Observable<any> {
    const userId = getUser();
  
    if (!userId) {
      return new Observable(observer => {
        observer.error('User ID is missing');
      });
    }
  
    return new Observable(observer => {
      supabase
        .from('session_exercises')
        .delete()
        .eq('session_id', id)
        .then(({ data: sessionExercisesData, error: sessionExercisesError }) => {
          if (sessionExercisesError) {
            console.error('Error deleting from session_exercises:', sessionExercisesError);
            observer.error(sessionExercisesError.message);
            return;
          }
  
          supabase
            .from('sessions')
            .delete()
            .eq('session_id', id)
            .then(({ data: sessionData, error: sessionError }) => {
              if (sessionError) {
                console.error('Error deleting from sessions:', sessionError);
                observer.error(sessionError.message);
                return;
              }
  
              if (sessionData || sessionExercisesData) {
                console.log('Session deleted successfully');
                observer.next({ message: 'Session deleted successfully' });
                observer.complete();
              } else {
                console.log('Session not found');
                observer.next({ message: 'Session not found' });
                observer.complete();
              }
            })
        })
    });
  }
  
  getExercises(): Observable<any> {
    const user = getUser();
  
    return new Observable(observer => {
      supabase
        .from('exercises')
        .select('*')
        .eq('user_id', user.id)
        .order('id', { ascending: true })
        .then(({ data, error }) => {
          if (error) {
            console.error('Supabase error:', error);
            observer.error('Error fetching exercises from Supabase');
          } else {
            observer.next(data);
            observer.complete();
          }
        })
    });
  }

  getExercisesList(sessionId: number): Observable<Exercise[]> {
    if (!sessionId || typeof sessionId !== 'number') {
      throw new Error(`Invalid sessionId: ${sessionId}`);
    }
  
    return new Observable(observer => {
      supabase
        .from('session_exercises')
        .select('exercise_id, exercise_title, reps, weight, breakTime, order') // Include order
        .eq('session_id', sessionId)
        .order('order', { ascending: true }) // Order by the 'order' column to ensure correct order
        .then(({ data, error }) => {
          console.log('Zapytanie wyniki:', { data, error });
  
          if (error) {
            console.error('Supabase error:', error, "sessionId: ", sessionId);
            observer.error('Error fetching exercises for session');
            return;
          }
  
          if (!data || data.length === 0) {
            console.warn('Brak ćwiczeń dla sesji:', sessionId);
            observer.next([]);
            observer.complete();
            return;
          }
  
          const exercisesMap: { [key: number]: Exercise } = {};
  
          data.forEach(item => {
            if (!item.exercise_id || !item.exercise_title) {
              console.warn('Niepoprawny rekord ćwiczenia:', item);
              return;
            }
  
            if (!exercisesMap[item.exercise_id]) {
              exercisesMap[item.exercise_id] = {
                id: item.exercise_id,
                exercise_id: item.exercise_id,
                exercise_title: item.exercise_title,
                title: item.exercise_title,
                sets: []
              };
            }
  
            exercisesMap[item.exercise_id].sets.push({
              reps: item.reps || 0,
              weight: item.weight || 0,
              breakTime: item.breakTime || 60 // Include breakTime
            });
          });
  
          observer.next(Object.values(exercisesMap));
          observer.complete();
        });
    });
  }  

  getAdvancedGroups(): Observable<string[]> {
    const userId = getUser();
    if (!userId) {
      throw new Error('User is not logged in.');
    }
  
    return new Observable((observer) => {
      supabase
        .from('sessions')
        .select('Advanced_group')
        .eq('user_id', userId)
        .not('Advanced_group', 'is', null)
        .then(({ data, error }) => {
          if (error) {
            console.error('Error fetching Advanced_group values:', error);
            observer.error('Error fetching Advanced_group values');
            return;
          }
  
          console.log('Fetched Advanced_group values:', data); // Debug log
  
          if (data) {
            // Extract unique values
            const uniqueGroups = Array.from(
              new Set(data.map((row) => row.Advanced_group))
            );
            observer.next(uniqueGroups);
          } else {
            observer.next([]);
          }
  
          observer.complete();
        });
    });
  }

  saveSessionAndExercises(
    title: string,
    days: string[],
    exercises: any[],
    group: string
  ): Observable<void> {
    const userId = getUser();
    if (!userId) {
      throw new Error('User is not logged in.');
    }
  
    return new Observable((observer) => {
      (async () => {
        try {
          for (const day of days) {
            const { data: sessionData, error: sessionError } = await supabase
              .from('sessions')
              .insert({
                user_id: userId,
                title: title,
                date: day,
                description: `Advanced group: ${group}`,
                Advanced_group: group,
              })
              .select('*')
              .single();
    
            // Ensure session_id and user_id are assigned to exercises
            const exercisesToInsert = exercises.map((exercise) => ({
              session_id: sessionData.session_id, // Assign session_id
              user_id: userId, // Assign user_id
              exercise_id: exercise.exercise_id,
              exercise_title: exercise.exercise_title,
              reps: exercise.reps || 0,
              weight: exercise.weight || 0,
              breakTime: exercise.breakTime || 60,
            }));
    
            if (exercisesToInsert.length > 0) {
              const { error: exercisesError } = await supabase
                .from('session_exercises')
                .insert(exercisesToInsert);
            
              if (exercisesError) {
                console.error('Error inserting into session_exercises:', exercisesError.message);
              } else {
                console.log('Inserted exercises for session:', sessionData.session_id);
              }
            } else {
              console.log('No exercises to insert for session:', sessionData.session_id);
            }
          }
  
          console.log('All changes saved successfully.');
          observer.next();
          observer.complete();
        } catch (error) {
          console.error('Error saving changes:', error);
          observer.error(error);
        }
      })();
    });
  }

  deleteAdvancedGroup(group: string): Observable<void> {
    const userId = getUser();
    if (!userId) {
      throw new Error('User is not logged in.');
    }
  
    return new Observable((observer) => {
      (async () => {
        try {
          // Fetch sessions associated with the Advanced_group
          const { data: sessions, error: fetchError } = await supabase
            .from('sessions')
            .select('session_id')
            .eq('user_id', userId)
            .eq('Advanced_group', group);
  
          if (fetchError) {
            console.error('Error fetching sessions for advanced group:', fetchError.message);
            observer.error(fetchError);
            return;
          }
  
          if (!sessions || sessions.length === 0) {
            console.warn('No sessions found for the advanced group:', group);
            observer.next();
            observer.complete();
            return;
          }
  
          const sessionIds = sessions.map((session) => session.session_id);
  
          // Delete all exercises associated with the sessions
          const { error: deleteExercisesError } = await supabase
            .from('session_exercises')
            .delete()
            .in('session_id', sessionIds);
  
          if (deleteExercisesError) {
            console.error('Error deleting exercises for advanced group:', deleteExercisesError.message);
            observer.error(deleteExercisesError);
            return;
          }
  
          // Delete the sessions
          const { error: deleteSessionsError } = await supabase
            .from('sessions')
            .delete()
            .in('session_id', sessionIds);
  
          if (deleteSessionsError) {
            console.error('Error deleting sessions for advanced group:', deleteSessionsError.message);
            observer.error(deleteSessionsError);
            return;
          }
  
          console.log('Advanced group deleted successfully:', group);
          observer.next();
          observer.complete();
        } catch (error) {
          console.error('Error deleting advanced group:', error);
          observer.error(error);
        }
      })();
    });
  }
}
