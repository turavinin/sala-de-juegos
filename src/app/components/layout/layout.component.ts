import { Component } from '@angular/core';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, MatIconModule, MatToolbarModule, RouterModule],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss'
})
export class LayoutComponent {

 constructor(private router: Router) {}

  logout() {
    this.router.navigate(["login"]);
  }

  goToHome() {
    this.router.navigate(["home"]);
  }
}
