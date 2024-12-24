import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavComponent } from './Nav/nav.component';
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Analytics } from "@vercel/analytics/react";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet, NavComponent],
  templateUrl: './app.component.html',
})
export class AppComponent {
}
