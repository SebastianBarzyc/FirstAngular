import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatOption, MatSelect } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { ExerciseService } from '../Exercises/exercises.service';
import { WorkoutService } from './workouts.service';

@Component({
  selector: 'app-exercise-item',
  templateUrl: './exercise-item.component.html',
  standalone: true,
  imports: [
    MatIconModule,
    MatOption,
    MatSelect,
    MatFormFieldModule,
    FormsModule,
    MatInputModule,
    CommonModule,
    MatButtonModule,
  ],
})
export class ExerciseItemComponent implements OnInit{
  @Input() exercise: any;
  @Input() index: number = 0;
  @Output() remove = new EventEmitter<number>();
  @Input() exercisesList: any[] = [];
  @Input() exercisesdata: any[] = [];
  @Input() planID: number = 1;
  
  exercises: any[] = [];
  tempExercises: any[] = [];

  constructor(
    private workoutService: WorkoutService,
    private exerciseService: ExerciseService,
  ) {}

  async ngOnInit(): Promise<void> {
    await this.loadExercises();
    console.log("exercisesdata: ", this.exercisesdata);
    console.log("exerciseslist: ", this.exercisesList);
  }

  removeExercise(id: number) {
    console.log("removing: ", id);
    this.remove.emit(id);
  }

  getExerciseTitleById(id: number): string {
    const exercise = this.exercises.find(ex => ex.id === id);
    return exercise ? exercise.title : '';
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

  getExerciseIdByTitle(title: string): number | null {
    const exercise = this.exercises.find(ex => ex.title === title);
    return exercise ? exercise.id : null;
  }

inputOnChange() {
  this.exercisesdata.forEach((exercise) => {
    const exerciseId = this.getExerciseIdByTitle(exercise.exercise_title);
console.log("exerciseId" + exerciseId);
    if (exerciseId !== null) {
      const inputSets = exercise.sets ?? 0;
      const inputReps = exercise.reps ?? 0;
      const existingExerciseIndex = this.exercisesList.findIndex(e => e.id === exercise.id);
      
      if (existingExerciseIndex !== -1) {
        this.exercisesList[existingExerciseIndex].sets = inputSets;
        this.exercisesList[existingExerciseIndex].reps = inputReps;
        this.exercisesList[existingExerciseIndex].exercise_id = exerciseId;
      } else {
        this.exercisesList.push({
          exercise_id: exerciseId,
          exercise_title: exercise.exercise_title,
          sets: inputSets,
          reps: inputReps,
        });
      }
    }
  });
}

}
