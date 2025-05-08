import { Component } from '@angular/core';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { SupabaseService } from '../../services/supabase.service';
import { ElementRef } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, MatIconModule, MatToolbarModule, RouterModule],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss'
})
export class LayoutComponent {

 constructor(private router: Router, private supabaseService: SupabaseService) {}
 isBouncing = false;

 logout() {
  this.supabaseService.logout().then(() => {
    this.router.navigate(['/login']);
  });
}

  goToHome() {
    this.router.navigate(["home"]);
  }

  goToAbout() {
    this.router.navigate(["about"]);
  }

  animateIcon(icon: MatIcon) {
    const el = icon._elementRef.nativeElement as HTMLElement;
  
    el.classList.remove('bounce');
    void el.offsetWidth; // forzar reflow
    el.classList.add('bounce');
  }
}
