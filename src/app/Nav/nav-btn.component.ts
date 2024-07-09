import { Component } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';

@Component({
    selector: 'navbtn',
    standalone: true,
    imports: [MatBadgeModule],
    template: `
    <button  mat-icon-button class="btn fw-bold"><ng-content></ng-content></button>
    `
})

export class NavBtnComponent {
    
};