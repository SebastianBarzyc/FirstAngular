import { Component, EventEmitter, Output, ViewChild, ViewContainerRef } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MatSelectModule } from '@angular/material/select';
import { ExerciseService } from "../Exercises/exerecise.service";
import { CommonModule } from '@angular/common';
import { WorkoutService } from "./workouts.service";

@Component({
    selector: 'app-workouts-exercise',
    standalone: true,
    templateUrl: './workouts-exercise.component.html',
    imports: [FormsModule, MatSelectModule, CommonModule]
  })

  export class WorkoutsExerciseComponent{
    selectedExercise: any;
    @Output() exerciseAdded = new EventEmitter<any>();
    constructor(private exerciseService: ExerciseService, private workoutService: WorkoutService) { }

    exerciseIdCounter = this.workoutService.getId();
    exercises: any[] = [];
    selectedValue: string | null = null;
    sets: number | null = null;
    reps: number | null = null;
    selectedExercises: { title: string, sets: number, reps: number }[] = [];
    workoutPlan: Array<{ exercise: string, sets: number, reps: number }> = [];
    localExercises: any[] = [];
    @ViewChild('parent', { read: ViewContainerRef, static: true }) target!: ViewContainerRef;

    ngOnInit() {
      this.loadExercises();
    }

    loadExercises(): void {
      this.exerciseService.getData()
        .subscribe(data => {
          this.exercises = data;
        });
    }

    onSubmit() {
      const sets = (document.getElementById('sets') as HTMLInputElement).value;
      const reps = (document.getElementById('reps') as HTMLInputElement).value;
      const exercise = this.selectedExercise;
      console.log('Submitted:', exercise, sets, reps);
    }

    onSelectChange(event: any): void {
      this.selectedExercise = event.value;
      console.log('Selected Exercise:', this.selectedExercise);
      this.workoutService.getId();
      console.log('Exercise ID:', this.exerciseIdCounter);
      this.checkAndAddExercise();
    }
  
    onSetsChange(): void {
      this.checkAndAddExercise();
    }
  
    onRepsChange(): void {
      this.checkAndAddExercise();
    }

    private checkAndAddExercise(): void {
      if (this.selectedExercise && this.sets !== null && this.reps !== null) {
        const newExercise = {
          title: this.selectedExercise,
          sets: this.sets,
          reps: this.reps
        };
        console.log("Adding exercise:", newExercise);
        this.exerciseService.addExercise(newExercise);
      }
    }
  
    addExercise(): void {
     if (this.selectedExercise && this.sets && this.reps) {
        this.workoutService.addExercise({
          title: this.selectedExercise,
          sets: this.sets,
          reps: this.reps
        });
      }
    }
}