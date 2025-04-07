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
  breakTime?: number; // Add breakTime property
}

@Injectable({
  providedIn: 'root'
})
export class CalendarService {
  refreshNeeded$ = new Subject<void>();

  constructor(private http: HttpClient) {}

  getSessions(): Observable<any[]> {
    return new Observable(observer => {
      const id = getUser();
      if (!id) {
        observer.error('Użytkownik nie jest zalogowany.');
        return;
      }

      supabase
        .from('sessions')
        .select('*')
        .eq('user_id', id)
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
/*
  editSession2(id: number): Observable<any> {
    return new Observable(observer => {
      supabase
        .from('sessions')
        .delete()
        .eq('session_id', id)
        .then(({ data, error }) => {
          if (error) {
            console.error('Błąd usuwania sesji:', error);
            observer.error('Błąd usuwania sesji: ' + error.message);
          } else {
            if (!data) {
              console.error('Nie znaleziono sesji do usunięcia');
              observer.error('Nie znaleziono sesji do usunięcia');
            } else {
              observer.next(data);
              observer.complete();
            }
          }
        })
    });
  }*/

  editSession3(exercises: any[], session_id: number): Observable<any> {
    const userId = getUser();
  
    if (!userId) {
      console.error('User ID is missing');
      return new Observable(observer => {
        observer.error('User ID is missing');
      });
    }
  
    return new Observable(observer => {
      // Delete all existing exercises for the session
      supabase
        .from('session_exercises')
        .delete()
        .eq('session_id', session_id)
        .then(({ error: deleteError }) => {
          if (deleteError) {
            observer.error('Error deleting existing exercises: ' + deleteError.message);
            return;
          }

          // Prepare the exercises data for insertion
          const exercisesData = exercises.flatMap((exercise, index) => 
            exercise.sets.map((set: Set) => ({
              exercise_id: exercise.exercise_id,
              reps: set.reps,
              weight: set.weight,
              breakTime: set.breakTime || 60,
              session_id: session_id,
              user_id: userId,
              exercise_title: exercise.exercise_title,
              order: index // Include the order to maintain the correct sequence
            }))
          );

          // Insert new exercises
          supabase
            .from('session_exercises')
            .insert(exercisesData)
            .select('*')
            .then(({ data, error }) => {
              if (error) {
                observer.error('Error inserting new exercises: ' + error.message);
                return;
              }

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
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error("Token is missing");
    }
  
    const userId = getUser();
  
    return new Observable(observer => {
      supabase
        .from('exercises')
        .select('*')
        .eq('user_id', userId)
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
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error("Token is missing");
    }
  
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
}
