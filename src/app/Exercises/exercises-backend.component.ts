// exercises-backend.component.ts
import { Component, OnInit, Input, inject } from '@angular/core';
import { ExerciseService } from './exercises.service';
import { CommonModule } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';
import { FormsModule } from '@angular/forms';
import { Subscription, catchError, tap } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { ExerciseEditComponent } from './exercise-edit.component';

@Component({
  selector: 'exercises-backend',
  templateUrl: './exercises-backend.component.html',
  standalone: true,
  providers: [ExerciseService],
  imports: [CommonModule, MatExpansionModule, FormsModule]
})
export class ExercisesBackend implements OnInit {
  @Input() isLoggedIn: boolean = false;
  exercises: any[] = [];
  isPanelExpanded = false;
  searchSubscription: Subscription = new Subscription();
  exercise = {
    title: '',
    description: '',
    isDefault: false
  };
  private refreshSubscription: Subscription = new Subscription();
  private staticUserId = '5d3ab3e6-e980-4df6-af92-e0063728a5fc'; // Static user ID

  ngOnInit(): void {
    this.refreshSubscription = this.exerciseService.onRefreshNeeded().subscribe(() => {
      console.log('Refresh needed triggered');
      this.loadExercises(this.isLoggedIn);
    });

    this.loadExercises(this.isLoggedIn);
  }

  ngOnDestroy(): void {
    this.refreshSubscription.unsubscribe();
    this.searchSubscription.unsubscribe();
  }

  loadExercises(includeUserExercises: boolean = false): void {
    this.exerciseService.getData(includeUserExercises).subscribe(data => {
      this.exercises = data.map(exercise => ({
        ...exercise,
        isDefault: exercise.user_id === this.staticUserId
      }));
      console.log('Loaded exercises:', this.exercises);
    });
  }

  togglePanel() {
    this.isPanelExpanded = !this.isPanelExpanded;
    this.loadExercises(this.isLoggedIn);
  }

  constructor(private exerciseService: ExerciseService) {}

  onSubmit(): void {
    console.log(this.exercise);

    this.exerciseService.addExercise(this.exercise).pipe(
      tap(response => {
        console.log('Exercise added successfully:', response);
        this.loadExercises(this.isLoggedIn);
        this.resetForm();
      }),
      catchError(error => {
        console.error('Error adding exercise:', error);
        throw error;
      })
    ).subscribe();
  }

  resetForm(): void {
    this.exercise = { title: '', description: '', isDefault: false };
  }

  readonly dialog = inject(MatDialog);

  openDialog(id: number, title: string, description: string): void {
    const dialogRef = this.dialog.open(ExerciseEditComponent, {
      data: { id, title, description },
      panelClass: 'editPanel'
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('Dialog closed');
      if (result) {
        this.loadExercises(this.isLoggedIn);
      }
    });
  }

  handleClick(exercise: any): void {
    if (exercise.isDefault) {
      console.log('Default exercise clicked, no action taken.');
      return;
    }
    this.openDialog(exercise.id, exercise.title, exercise.description);
  }
}
