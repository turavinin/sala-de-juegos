import { Component } from '@angular/core';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { SupabaseService } from '../../services/supabase.service';
@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, MatIconModule, MatToolbarModule, RouterModule],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss'
})
export class LayoutComponent {

 constructor(private router: Router, private supabaseService: SupabaseService) {}

 logout() {
  this.supabaseService.logout().then(() => {
    this.router.navigate(['/login']);
  });
}

  goToHome() {
    this.router.navigate(["home"]);
  }
}
