import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatExpansionModule } from '@angular/material/expansion';
import { Component, ViewChild, OnInit, AfterViewInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ExercisesBackend } from './exercises-backend.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { getUser } from '../supabase-client';
import { ProfileComponent } from '../Profile/profile.component';

@Component({
  selector: 'app-exercises',
  templateUrl: './exercises.component.html',
  standalone: true,
  providers: [ProfileComponent],
  imports: [MatFormFieldModule, MatInputModule, FormsModule, MatButtonModule, FormsModule, MatExpansionModule, CommonModule, ExercisesBackend],
})
export class ExercisesComponent implements OnInit, AfterViewInit {
  @ViewChild(ExercisesBackend) exercisesBackend!: ExercisesBackend;
  isLoggedIn: boolean = false;
  searchQuery: string = '';
  isToggled: boolean = false;

  constructor(private router: Router) {}

  ngOnInit() {
    const user = getUser();
    if(user){
      this.isLoggedIn = true;
    }
    const storedToggleState = localStorage.getItem('isToggled');
    this.isToggled = storedToggleState ? JSON.parse(storedToggleState) : this.isLoggedIn;
  }

  ngAfterViewInit() {
    this.loadExercises(this.isToggled);
  }

  loadExercises(includeUserExercises: boolean) {
    if (this.exercisesBackend) {
      this.exercisesBackend.loadExercises(includeUserExercises);
    }
  }

  togglePanel() {
    if (this.exercisesBackend) {
      this.exercisesBackend.togglePanel();
    }
  }

  onToggleChange(event: any) {
    console.log('Toggle switch changed:', this.isToggled);
    localStorage.setItem('isToggled', JSON.stringify(this.isToggled));
    if (!this.isLoggedIn && this.isToggled) {
      this.router.navigate(['/Profile']);
    } else {
      this.loadExercises(this.isToggled);
    }
  }

  onSearchChange() {
    if (this.exercisesBackend) {
      this.exercisesBackend.searchSubject.next(this.searchQuery);
    }
  }
}