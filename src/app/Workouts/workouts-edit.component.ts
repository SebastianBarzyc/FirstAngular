import { CommonModule } from '@angular/common';
import { WorkoutService } from './workouts.service';
import { ChangeDetectorRef, Component, ComponentFactoryResolver, ComponentRef, ElementRef, inject, Inject, Input, OnInit, SimpleChanges, ViewChild, ViewContainerRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatOption, MatSelect } from '@angular/material/select';
import { ExerciseService } from '../Exercises/exercises.service';
import { MatIconModule } from '@angular/material/icon';
import { ExerciseItemComponent } from './exercise-item.component';
import { MatSelectModule } from '@angular/material/select';
import { forkJoin } from 'rxjs';

interface Exercise {
  idPlan: number;
  idExercise: number;
  sets: number;
  reps: number;
}

@Component({
  selector: 'workout-edit',
  templateUrl: './workouts-edit.component.html',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    CommonModule,
    MatSelect,
    MatOption,
    MatIconModule,
    ExerciseItemComponent,
    MatSelectModule,
  ],
})
export class WorkoutEditComponent implements OnInit {

  @ViewChild('hiddenInput') hiddenInput?: ElementRef;
  @ViewChild('textarea') textarea!: ElementRef;

  readonly dialogRef = inject(MatDialogRef<WorkoutEditComponent>);
  @Input() workout: any;

  exercisesMap: Map<number, any[]> = new Map();
  workouts: any[] = [];
  exercises: any[] = [];
  exercises2: any[] = [];
  exercises3: any[] = [];
  tempExercises: Exercise[] = [];
  selectedValue: string = "";
  exerciseTitles: { [key: string]: string } = {};
  selectedExercise: string[] = [];
  exercisesList: any[] = [];
  planID: number = 0;
  selectedPlanID: number = 0;
  exercisesForPlan: any[] = [];
  exercisesForCurrentPlan: any[] = [];
  private exercisesLoaded = false;
  public filteredExercises: any[] = [];
  updatedExercises: any[] = [];


  WorkoutID: number = 0;
  WorkoutTitle: string;
  WorkoutDesc: string;

  constructor(private workoutService: WorkoutService, private exerciseService: ExerciseService, @Inject(MAT_DIALOG_DATA) public data: { id: number, title: string, description: string }) {
    this.WorkoutID = data.id;
    this.WorkoutTitle = data.title;
    this.WorkoutDesc = data.description;
  }

  @ViewChild('parent', { read: ViewContainerRef })
  target: ViewContainerRef | undefined;
  componentRef: ComponentRef<any> | undefined;

  async ngOnInit(): Promise<void> {
    try {
      console.log('ngOnInit called');
      if (!this.exercisesLoaded) {
        await this.loadWorkouts();
        console.log('Workouts loaded');

        await this.loadExercises();
        console.log('Exercises loaded');

        await this.loadExercises2();
        console.log('Exercises2 loaded');

        await this.loadExercisesList();
        console.log('ExercisesList loaded');

        await this.loadExercisesForPlan(this.WorkoutID);
        console.log('Exercises for plan loaded');

        console.log('Exercises3:', this.exercises3);
      }
    } catch (error) {
      console.error('Error during initialization:', error);
    }
  }

  ngAfterViewInit(): void {
    if (this.textarea) {
      this.autoResize(this.textarea.nativeElement);
    }
  }

  loadWorkouts(): Promise<void> {
    return this.workoutService.getData().toPromise().then(response => {
      this.workouts = response.data;
      setTimeout(() => {
        if (this.textarea) {
          this.autoResize(this.textarea.nativeElement);
        }
      }, 0);
    });
  }

  async getExerciseTitleById(id: number): Promise<string> {
    const exercise = this.exercises3.find(ex => ex.id === id);
    return exercise ? exercise.title : '';
  }

  async loadExercisesList(): Promise<void> {
    this.exercisesList = await this.workoutService.getExercisesList();
  }

  loadExercisesForPlan(planID: number): void {
    console.log('Loading exercises for planID:', planID);
    this.workoutService.getExercisesForPlan(planID).subscribe({
        next: (response) => {
            console.log('Received exercises for planID:', planID, response.data);
            if (response.data) {
                this.exercisesMap.set(planID, response.data);
                this.filteredExercises = response.data; // Update variable
                console.log('Exercises stored in map for planID:', planID, this.exercisesMap.get(planID));
                this.getExercisesForWorkout(planID);
            } else {
                console.warn('No exercises found in response for planID:', planID);
            }
        },
        error: (error) => {
            console.error('Error loading exercises for planID:', planID, error);
        }
    });
}


  async loadExercises(): Promise<void> {
    if (this.exercisesLoaded) {
      return;
    }
    this.exercisesLoaded = true;
    try {
      await this.loadExercises3();
      const response = await this.workoutService.getExercisesForPlan(this.WorkoutID).toPromise();
      this.exercises = response.data;
      await this.addTitlesToExercises();
      console.log('Exercises after loading:', this.exercises);
    } catch (error) {
      console.error('Error loading exercises:', error);
    }
  }

  updateExercisesMap(): void {
    this.exercisesMap.set(this.WorkoutID, [...this.exercises]);
    console.log('Updated exercisesMap:', this.exercisesMap);
  }

  async addTitlesToExercises(): Promise<void> {
    for (const exercise of this.exercises) {
      console.log('Exercise before title assignment:', exercise);
      
      if (!exercise.title) { // Check if title is not already assigned
          try {
              const title = await this.getExerciseTitleById(exercise.exercise_id);
              if (title) {
                  exercise.title = title;
                  console.log('Added title:', title, 'to exercise ID:', exercise.exercise_id, 'exercise.title: ', exercise.title);
              } else {
                  console.error(`Title not found for exercise ID ${exercise.exercise_id}`);
              }
          } catch (error) {
              console.error(`Error retrieving title for exercise ID ${exercise.exercise_id}:`, error);
          }
      } else {
          console.log('Title already assigned:', exercise.title, 'for exercise ID:', exercise.exercise_id);
      }
      
      // After the title assignment (successful or not), push the updated exercise to the new array
      this.updatedExercises.push(exercise);
      console.log('Exercise after title assignment:', exercise);
  }

  this.exercisesList = this.updatedExercises; // Assign the updated exercises to exercisesList
  console.log('Updated exercisesList:', this.exercisesList); // Log the updated exercisesList
}

  async loadExercises3(): Promise<void> {
    try {
      const data = await this.exerciseService.getData().toPromise();
      console.log('Data from loadExercises3:', data);
      this.exercises3 = data;
    } catch (error) {
      console.error('Error loading exercises3:', error);
    }
  }

  async loadExercises2(): Promise<void> {
    return this.workoutService.getData().toPromise().then(response => {
      if (response && Array.isArray(response.data)) {
        this.exercises2 = response.data;
      }
      this.exercises = this.exercises.map(exercise => {
        const foundExercise = this.exercises3.find(ex => ex.id === exercise.id);
        return {
          ...exercise,
          title: foundExercise ? foundExercise.title : 'Unknown Exercise'
        };
      });
    }).catch(error => {
      console.error('Error loading exercises2:', error);
      this.exercises2 = [];
    });
  }

  getId() {
    return this.data.id;
  }

  Save(id: number, newTitle: string, newDescription: string): void {
    // Update workout
    this.workoutService.editworkout(id, newTitle, newDescription).subscribe({
      next: response => {
        console.log('Response from server (editWorkout):', response);
      },
      error: error => {
        console.error('Error from server (editWorkout):', error);
      }
    });

    // Retrieve the list of exercises and temporary exercises
    this.exercisesList = this.workoutService.getExercisesList();
    this.tempExercises = this.workoutService.getTempExercises();

    // Update planID in tempExercises
    const updatedTempExercises = this.tempExercises.map(exercise => ({
      ...exercise,
      planId: this.planID
    }));

    // Save each exercise
    const saveObservables = updatedTempExercises.map(exercise =>
      this.workoutService.editworkout3(
        exercise.planId,
        exercise.idExercise,
        exercise.sets,
        exercise.reps
      )
    );

    // Wait for all saves to complete
    forkJoin(saveObservables).subscribe({
      next: () => {
        this.dialogRef.close();
        this.loadWorkouts();
      },
      error: error => {
        console.error('Error occurred while saving exercises:', error);
      }
    });

    console.log('PlanID:', this.planID);
    console.log('TempExercises:', this.tempExercises);
  }

  autoResize(textarea: HTMLTextAreaElement) {
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  }

  Delete(id: number) {
    this.workoutService.deleteworkout(id).subscribe({
      next: response => {
        console.log('Response from server:', response);
        this.dialogRef.close();
      },
      error: error => {
        console.error('Error from server:', error);
      }
    });
    this.loadWorkouts();
  }

  removeExercise(exerciseId: number): void {
    console.log('Removing exercise ID:', exerciseId);
    const currentExercises = this.getExercisesForWorkout(this.workout.id);
    const updatedExercises = currentExercises.filter(ex => ex.exercise_id !== exerciseId);
    this.exercisesMap.set(this.workout.id, updatedExercises);
  }

  getExercisesForWorkout(planID: number): any[] {
    const exercises = this.exercisesMap.get(planID);
    return exercises || [];
}

  addExercise(): void {
    const newExercise = {
      exercise_id: this.exercisesList.length + 1, // Unique ID
      title: '',  // Default exercise title
      sets: 0,    // Default number of sets
      reps: 0     // Default number of reps
    };

    this.exercisesList.push(newExercise);  // Add to main list
    this.workoutService.setExercisesList(this.exercisesList);  // Save updated list
  }
}
