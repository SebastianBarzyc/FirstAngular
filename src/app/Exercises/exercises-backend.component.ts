// exercises-backend.component.ts
import { Component, OnInit, inject } from '@angular/core';
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
  exercises: any[] = [];
  isPanelExpanded = false;
  searchSubscription: Subscription = new Subscription();
  exercise = {
    title: '',
    description: ''
  };
  private refreshSubscription: Subscription = new Subscription();

  ngOnInit(): void {
    this.refreshSubscription = this.exerciseService.onRefreshNeeded().subscribe(() => {
      console.log('Refresh needed triggered');
      this.loadExercises();
    });

    this.loadExercises();
  }

  ngOnDestroy(): void {
    this.refreshSubscription.unsubscribe();
    this.searchSubscription.unsubscribe();
  }

  loadExercises(): void {
    this.exerciseService.getData().subscribe(data => {
      this.exercises = data;
      console.log('Loaded exercises:', data);
    });
  }

  togglePanel() {
    this.isPanelExpanded = !this.isPanelExpanded;
  }

  constructor(private exerciseService: ExerciseService) {}

  onSubmit(): void {
    console.log(this.exercise);  // Check the form data

    this.exerciseService.addExercise(this.exercise).pipe(
      tap(response => {
        console.log('Exercise added successfully:', response);
        this.loadExercises();  // Reload exercises after adding
        this.resetForm();
      }),
      catchError(error => {
        console.error('Error adding exercise:', error);
        throw error;
      })
    ).subscribe();
  }

  resetForm(): void {
    this.exercise = { title: '', description: '' };
  }

  readonly dialog = inject(MatDialog);

  openDialog(id: number, title: string, description: string): void {
    const dialogRef = this.dialog.open(ExerciseEditComponent, {
      data: { id, title, description },
      panelClass: 'editPanel'
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('Dialog closed');
      // Po zamknięciu okna dialogowego, odśwież ćwiczenia
      if (result) {
        this.loadExercises();
      }
    });
  }
}
