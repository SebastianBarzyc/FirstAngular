import { Component, OnInit, Input, inject } from '@angular/core';
import { ExerciseService } from './exercises.service';
import { CommonModule } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { ExerciseEditComponent } from './exercise-edit.component';
import { getUser } from '../supabase-client';
import { Router } from '@angular/router';

@Component({
  selector: 'exercises-backend',
  templateUrl: './exercises-backend.component.html',
  standalone: true,
  providers: [ExerciseService],
  imports: [CommonModule, MatExpansionModule, FormsModule]
})
export class ExercisesBackend implements OnInit {
  @Input() isLoggedIn: boolean = false;
  @Input() searchQuery: string = '';
  @Input() includeUserExercises: boolean = false;
  exercises: any[] = [];
  filteredExercises: any[] = [];
  isPanelExpanded = false;
  searchSubject: Subject<string> = new Subject<string>();
  exercise = {
    title: '',
    description: ''
  };
  private staticUserId = '5d3ab3e6-e980-4df6-af92-e0063728a5fc';

  constructor(private exerciseService: ExerciseService, private router: Router) {}

  ngOnInit(): void {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(query => {
      this.searchQuery = query;
      this.filterExercises();
    });

    if (!this.isLoggedIn) {
      console.warn('User is not logged in. Redirecting to Profile.');
      this.router.navigate(['/Profile']);
    } else {
      this.loadExercises(this.includeUserExercises);
    }
  }

  loadExercises(includeUserExercises: boolean = false): void {
    this.exerciseService.getExercises(includeUserExercises).subscribe({
      next: (data) => {
        this.exercises = data.map(exercise => ({
          ...exercise,
          isDefault: exercise.user_id === this.staticUserId
        }));
        this.filterExercises();
      console.log('Loaded exercises:', this.exercises);
      }, 
      error: (error) => {
        console.error('Error loading exercises:', error);
      }
    });
  }

  filterExercises(): void {
    if (this.searchQuery) {
      this.filteredExercises = this.exercises.filter(exercise =>
        exercise.title.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    } else {
      this.filteredExercises = this.exercises;
    }
  }

  togglePanel(): void {
    this.isPanelExpanded = !this.isPanelExpanded;
    if (this.isPanelExpanded) {
      this.loadExercises(this.includeUserExercises);
    }
  }

  async onSubmit(): Promise<void> {
    console.log(this.exercise);
    if (getUser() === null) {
      console.error('User ID is null, cannot add exercise.');
      this.router.navigate(['/Profile']);
    } else {
      await this.exerciseService.addExercise(this.exercise);
      console.log('Exercise added successfully');
      this.loadExercises(this.includeUserExercises);
      this.resetForm();
    }
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
      if (result) {
        this.loadExercises(this.includeUserExercises);
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

