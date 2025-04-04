import { Component, OnInit } from '@angular/core';
import { NgxChartsModule, TooltipModule } from '@swimlane/ngx-charts';
import { createClient } from '@supabase/supabase-js';
import { supabase, getUser } from '../supabase-client';

// Define interfaces outside the component
interface ChartDetails {
  [key: string]: number[]; // e.g., "reps10": [100, 110, 120]
}

interface ChartSeries {
  name: string;
  value: number;
  details: ChartDetails;
}

interface ChartData {
  name: string;
  series: ChartSeries[];
}

@Component({
  selector: 'app-progress',
  standalone: true,
  imports: [NgxChartsModule, TooltipModule], // Import NgxChartsModule here
  templateUrl: './progress.component.html',
})
export class ProgressComponent implements OnInit {
  chartData: ChartData[] = [];
  async ngOnInit() {
    await this.fetchChartData();
  }

  async fetchChartData() {
    try {
      // Fetch sessions
      const { data: sessions, error: sessionsError } = await supabase
        .from('sessions')
        .select('session_id, date');

      if (sessionsError) throw sessionsError;

      // Fetch session_exercises
      const { data: sessionExercises, error: exercisesError } = await supabase
        .from('session_exercises')
        .select('session_id, exercise_title, reps, weight');

      if (exercisesError) throw exercisesError;

      // Debug logs
      console.log('Sessions:', sessions);
      console.log('Session Exercises:', sessionExercises);

      // Map data to chart format
      const chartDataMap: { [key: string]: any } = {};

      sessions.forEach((session) => {
        const sessionExercisesForSession = sessionExercises.filter(
          (exercise) => exercise.session_id === session.session_id
        );

        sessionExercisesForSession.forEach((exercise) => {
          // Skip if exercise_title or session.date is null
          if (!exercise.exercise_title || !session.date) {
            console.warn('Skipping invalid data:', exercise, session);
            return;
          }

          if (!chartDataMap[exercise.exercise_title]) {
            chartDataMap[exercise.exercise_title] = {
              name: exercise.exercise_title,
              series: [],
            };
          }

          // Find or create the entry for this date
          let dateEntry = chartDataMap[exercise.exercise_title].series.find(
            (entry: any) => entry.name === session.date
          );

          if (!dateEntry) {
            dateEntry = {
              name: session.date,
              value: 0, // Will be updated to the max weight
              details: {}, // Will store aggregated reps and sets
            };
            chartDataMap[exercise.exercise_title].series.push(dateEntry);
          }

          // Update the max weight for the day
          dateEntry.value = Math.max(dateEntry.value, exercise.weight);

          // Aggregate reps and sets
          if (!dateEntry.details[`reps${exercise.reps}`]) {
            dateEntry.details[`reps${exercise.reps}`] = [];
          }
          dateEntry.details[`reps${exercise.reps}`].push(exercise.weight);
        });
      });

      this.chartData = Object.values(chartDataMap);
      console.log('Chart Data:', this.chartData);
    } catch (error) {
      console.error('Error fetching chart data:', error);
    }
  }
}
