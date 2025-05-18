import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { SupabaseService } from '../../services/supabase.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { Results } from '../../models/results.model';

export interface Transaction {
  game: string;
  date: string;
  points: number;
}

@Component({
  selector: 'app-home',
  imports: [
    MatCardModule,
    CommonModule,
    FormsModule,
    MatInputModule,
    MatButtonModule,
    MatListModule,
    MatIconModule,
    MatTableModule,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  messages: any[] = [];
  results: Results[] = [];
  newMessage: string = '';
  subscription: any;
  currentUserId: string | null = null;
  chatOpen = false;
  totalPoints = 0;

  ahorcadoGamePath = 'games/ahorcado';
  preguntadosGamePath = 'games/preguntados';
  mayorMenorGamePath = 'games/mayor-menor';
  tragamonedasGamePath = 'games/tragamonedas';

  constructor(private router: Router, private supabase: SupabaseService) {}

  async ngOnInit() {
    this.messages = await this.supabase.getRecentMessages();
    this.subscription = this.supabase.onNewMessages((newMsg) => {
      this.messages.push(newMsg);
    });
    this.currentUserId = await this.supabase.getUserId();
    this.results = await this.supabase.getResults();
    this.setTotalPoints();
  }

  sendMessage() {
    if (this.newMessage.trim()) {
      this.supabase.sendMessage(this.newMessage).subscribe((resp) => {
        if (resp.success) {
          this.newMessage = '';
        } else {
          console.error('Error sending message:', resp.message);
        }
      });
    }
  }

  goTo(path: string) {
    this.router.navigate([path]);
  }

  toggleChat() {
    this.chatOpen = !this.chatOpen;
  }

  setTotalPoints() {
    this.totalPoints = this.results.reduce((acc, result) => acc + result.total_points, 0);
    this.totalPoints = this.results[0]?.total_points || 0;
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }
}
