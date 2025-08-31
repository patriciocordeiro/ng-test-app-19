import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-task-layout',
  imports: [RouterModule, CommonModule],
  templateUrl: './task-layout.component.html',
  styleUrls: ['./task-layout.component.scss'],
})
export class TaskLayoutComponent {}
