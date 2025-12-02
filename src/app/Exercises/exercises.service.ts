import { Injectable } from '@angular/core';
import { from, map, Observable} from 'rxjs';
import { supabase, getUser } from '../supabase-client';

@Injectable({
  providedIn: 'root'
})
export class ExerciseService {
  user: any = null;

  constructor() {
      this.user = getUser();
  }

  getExercises(includeUserExercises: boolean = false): Observable<any[]> {
    let query = supabase
      .from('exercises')
      .select('*')
      .order('id', { ascending: true });

    if (!includeUserExercises) {
      query = query.or(`user_id.eq.${this.user.id},user_id.eq.5d3ab3e6-e980-4df6-af92-e0063728a5fc`);
    } else {
      query = query.eq('user_id', this.user.id);
    }

    return from(query).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data || [];
      })
    );
  }
  
  async addExercise(exercise: any): Promise<any> {
    try {
      const { error } = await supabase
        .from('exercises')
        .insert([{ ...exercise, user_id: this.user.id }])

      if (error) {
        console.error('Supabase error:', error.message);
      }

    } catch (err) {
      console.error('Unexpected error:', err);
    }
  }

  async editExercise(id: number, newTitle: string, newDescription: string): Promise<any> {
    try {
      const { error } = await supabase
        .from('exercises')
        .update({
          title: newTitle,
          description: newDescription
        })
        .eq('id', id)

      if (error) {
        console.error('Supabase error:', error.message);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
    }
  }

  async deleteExercise(id: number): Promise<any> {
    try {
      const { error } = await supabase
        .from('exercises')
        .delete()
        .eq('id', id)
      if (error) {
        console.error('Supabase error:', error.message);
      }

    } catch (err) {
      console.error('Unexpected error:', err);
    }
  }

}
