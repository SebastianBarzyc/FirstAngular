import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatOption, MatSelect } from '@angular/material/select';
import { ExerciseService } from '../Exercises/exercises.service';

interface Set {
  reps: number;
  weight: number;
  breakTime?: number; // Add breakTime property
  id?: number; // Add id property
}

interface Exercise {
  id: number;
  exercise_id: number;
  exercise_title: string;
  title: string;
  reps?: number[];
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


  @Output() updateExercise = new EventEmitter<any>();

  updateExerciseTitle(selectedTitle: string): void {
    const selectedExercise = this.exercises.find(ex => ex.title === selectedTitle);
    
    if (selectedExercise) {
      this.exercise.exercise_title = selectedExercise.title;
      this.exercise.exercise_id = selectedExercise.id;
  
      this.updateExercise.emit({
        exercise_id: this.exercise.exercise_id,
        exercise_title: this.exercise.exercise_title
      });
  
      console.log("Updated exercise:", this.exercise.exercise_id, this.exercise.exercise_title);
    } else {
      console.error(`Exercise with title "${selectedTitle}" not found.`);
    }
  }
  

  async ngOnInit(): Promise<void> {
    await this.loadExercises();
    if (this.exercise.reps && Array.isArray(this.exercise.reps)) {
      this.exercise.sets = this.exercise.reps.map((repsValue, index) => ({
        reps: repsValue,
        weight: 0,
        id: index + 1 // Ensure each set has a unique id
      }));
    }
  }

  removeExercise(id: number): void {
    this.removeExerciseEvent.emit(id);

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
    const newSet = { reps: 0, weight: 0, breakTime: 60 }; // Add breakTime with default value
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

