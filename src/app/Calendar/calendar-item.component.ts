import { CalendarService } from './calendar.service';
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButton, MatButtonModule } from '@angular/material/button';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatOption, MatSelect } from '@angular/material/select';
import { ExerciseService } from '../Exercises/exercises.service';

interface Set {
  reps: number;
  weight: number;
}

interface Exercise {
  id: number;
  exercise_id: number;
  exercise_title: string;
  title: string;
  sets: Set[];
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
    private exerciseService: ExerciseService,
  ) {}
  @Output() removeExerciseEvent = new EventEmitter<number>();
  @Input() exercises: any[] = [];
  @Input() index: number = 0;
  @Input() exercise!: Exercise;

  exercisesList: Exercise[] = [];

  async ngOnInit(): Promise<void> {
    await this.loadExercises();
  }

  removeExercise(id: number): void {
    this.removeExerciseEvent.emit(id);

  }

  inputOnChange(){

  }

  loadExercises(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.exerciseService.getData()
        .subscribe({
          next: (data) => {
            this.exercises = data;
            resolve(); 
          },
          error: (error) => {
            console.error('Error loading exercises3:', error);
            reject(error);
          }
        });
    });
  }

  addSet(exercise: any): void {
    const newSet = { reps: 0, weight: 0 };
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

