import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatExpansionModule } from '@angular/material/expansion';
import { Component, ViewChild, OnInit, AfterViewInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ExercisesBackend } from './exercises-backend.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { supabase } from '../supabase-client';

@Component({
  selector: 'app-exercises',
  templateUrl: './exercises.component.html',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, FormsModule, MatButtonModule, FormsModule, MatExpansionModule, CommonModule, ExercisesBackend],
})
export class ExercisesComponent implements OnInit, AfterViewInit {
  @ViewChild(ExercisesBackend) exercisesBackend!: ExercisesBackend;
  isToggled: boolean = false;
  isLoggedIn: boolean = false;

  constructor(private router: Router) {}

  ngOnInit() {
    const session = localStorage.getItem('session');
    this.isLoggedIn = !!session;
    this.isToggled = this.isLoggedIn;
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
    if (!this.isLoggedIn && this.isToggled) {
      this.router.navigate(['/Profile']);
    } else {
      this.loadExercises(this.isToggled);
    }
  }
}