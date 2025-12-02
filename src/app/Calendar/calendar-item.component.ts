import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatOption, MatSelect } from '@angular/material/select';
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
export class CalendarItemComponent implements OnInit{
  constructor(
    private calendarService: CalendarService,
  ) {}
  @Output() removeExerciseEvent = new EventEmitter<number>();
  @Input() exercise!: Exercise;
  @Input() index: number = 0;
  allExercises: any[] = [];

  async ngOnInit(): Promise<void> {
    await this.loadExercises();
  }

  private processExerciseSets(): void {
    if (this.exercise.reps && Array.isArray(this.exercise.reps)) {
      this.exercise.sets = this.exercise.reps.map((repsValue, index) => ({
        reps: repsValue,
        weight: this.exercise.sets[index]?.weight || 0,
        breakTime: this.exercise.sets[index]?.breakTime || 0,
        id: index + 1
      }));
    }
  }

  updateExerciseTitle(selectedTitle: string): void {
    const selectedExercise = this.allExercises.find(ex => ex.title === selectedTitle);
    
    if (selectedExercise) {
      this.exercise.exercise_title = selectedExercise.title;
      this.exercise.exercise_id = selectedExercise.id;
  
      console.log("Updated exercise:", this.exercise.exercise_id, this.exercise.exercise_title);
    } else {
      console.error(`Exercise with title "${selectedTitle}" not found.`);
    }
  }

  async loadExercises(): Promise<void> {
    try {
      this.calendarService.getExercises().subscribe(data => {
        this.allExercises = data;
      });
      if (this.exercise) {
        this.processExerciseSets();
      }
    } catch (error) {
      console.error('Error loading exercises:', error);
    }
  }

  removeExercise(id: number): void {
    this.removeExerciseEvent.emit(id);
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
