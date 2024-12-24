import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { supabase, getUser } from '../supabase-client';

@Injectable({
  providedIn: 'root'
})
export class ExerciseService {
  private refreshNeeded$ = new Subject<void>();

  constructor() {}

  getData(): Observable<any[]> {
    return new Observable(observer => {
      const userId = getUser();

      if (!userId) {
        observer.error('Nie znaleziono identyfikatora użytkownika.');
        return;
      }

      supabase
        .from('exercises')
        .select('*')
        .eq('user_id', userId)
        .order('id', { ascending: true })
        .then(({ data, error }: { data: any[] | null; error: any }) => {
          if (error) {
            console.error('Błąd pobierania ćwiczeń:', error);
            observer.error('Wystąpił błąd podczas pobierania ćwiczeń.');
          } else {
            observer.next(data || []);
          }
          observer.complete();
        })
    });
  }
  
  addExercise(exercise: any): Observable<any> {
    return new Observable(observer => {
      const userId = getUser();
      if (!userId) {
        observer.error('Nie znaleziono identyfikatora użytkownika.');
        return;
      }
  
      supabase
        .from('exercises')
        .insert([{ ...exercise, user_id: userId }])
        .then(({ data, error }: { data: any | null; error: any }) => {
          if (error) {
            observer.error('Błąd dodawania ćwiczenia: ' + error.message);
            return;
          }
          this.refreshNeeded$.next();

          if (data && data.length > 0) {
            observer.next({ message: 'Ćwiczenie dodane pomyślnie', data: data[0] });
          } else {
            observer.error('Brak zwróconych danych po dodaniu ćwiczenia.');
          }
  
          observer.complete();
        })
    });
  }  

  editExercise(id: number, newTitle: string, newDescription: string): Observable<any> {
    return new Observable(observer => {
      const query = supabase
        .from('exercises')
        .update({
          title: newTitle,
          description: newDescription
        })
        .eq('id', id);

        query.then(({ data, error }: { data: any[] | null; error: any }) => {
          if (error) {
            observer.error('Error editing exercise: ' + error.message);
            return;
          }
          this.refreshNeeded$.next();

          if (data && data.length > 0) {
            observer.next({ message: 'Exercise editing successfully' });
          } else {
            observer.next({ message: 'Exercise not found' });
          }
          observer.complete();
        })
    });
  }

  deleteExercise(id: number): Observable<any> {
    this.refreshNeeded$.next();
    return new Observable(observer => {
      const query = supabase
        .from('exercises')
        .delete()
        .eq('id', id);

      query.then(({ data, error }: { data: any[] | null; error: any }) => {
          if (error) {
            observer.error('Error deleting exercise: ' + error.message);
            return;
          }
          this.refreshNeeded$.next();

          if (data && data.length > 0) {
            observer.next({ message: 'Exercise deleted successfully' });
          } else {
            observer.next({ message: 'Exercise not found' });
          }
          observer.complete();
        })
    });
  }
  
  onRefreshNeeded(): Observable<void> {
    return this.refreshNeeded$.asObservable();
  }
}
