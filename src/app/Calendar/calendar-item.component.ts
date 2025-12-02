import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatOption, MatSelect } from '@angular/material/select';
import { Subscription } from 'rxjs';
import { CalendarService} from './calendar.service';

interface Set {
  reps: number;
  weight: number;
  breakTime?: number;
  id?: number;
}

interface Exercise {
  exercise_id: number;
  exercise_title: string;
  title: string;
  reps?: number[];
  sets: Set[];
  order: number;
}

@Component({
  selector: 'calendar-item',
  templateUrl: './calendar-item.component.html',
  standalone: true,
  imports: [
    MatIcon,
    MatLabel,
    MatFormField,
    MatSelect,
    MatInput,
    MatOption,
    FormsModule,
    CommonModule,
    MatButtonModule
  ],
})
export class CalendarItemComponent {
  constructor(
    private calendarService: CalendarService,
  ) {}
  @Output() removeExerciseEvent = new EventEmitter<number>();
  @Input() exercises: any[] = [];
  @Input() exercise!: Exercise;

  updateExerciseTitle(selectedTitle: string): void {
    const selectedExercise = this.exercises.find(ex => ex.title === selectedTitle);
    
    if (selectedExercise) {
      this.exercise.exercise_title = selectedExercise.title;
      this.exercise.exercise_id = selectedExercise.id;
  
      console.log("Updated exercise:", this.exercise.exercise_id, this.exercise.exercise_title);
    } else {
      console.error(`Exercise with title "${selectedTitle}" not found.`);
    }
  }

  ngOnInit(): void {
    this.loadExercises();
    if (this.exercise.reps && Array.isArray(this.exercise.reps)) {
      this.exercise.sets = this.exercise.reps.map((repsValue, index) => ({
      reps: repsValue,
      weight: this.exercise.sets[index]?.weight || 0,
      breakTime: this.exercise.sets[index]?.breakTime || 0,
      id: index + 1
      }));
    }
    console.log("loadexercises: ", this.exercises);
  }

  removeExercise(id: number): void {
    this.removeExerciseEvent.emit(id);
  }

  loadExercises(): Subscription {
    return this.calendarService.getExercises().subscribe({
      next: (response) => {
        this.exercises = response.data;
      },
      error: (error) => {
        console.error('Error loading exercises:', error);
      }
    });
  }

  addSet(exercise: any): void {
    const newSet = { reps: 0, weight: 0, breakTime: 0 };
    exercise.sets.push(newSet);
  }

  removeSet(exercise: any): void {
    if (exercise.sets.length > 1) {
      exercise.sets.pop();
    } else {
      alert('Minimum 1 set must remain');
    }
  }
}

