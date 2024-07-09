import { Component } from '@angular/core';
import { NavBtnComponent } from './nav-btn.component';

@Component({
    selector: 'nav',
    standalone: true,
    imports: [ NavBtnComponent ],
    templateUrl: './nav.component.html'
})

export class NavComponent {
};