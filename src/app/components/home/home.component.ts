import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { SupabaseService } from '../../services/supabase.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';

@Component({
  selector: 'app-home',
  imports: [MatCardModule, CommonModule, FormsModule, MatInputModule, MatButtonModule, MatListModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

  messages: any[] = [];
  newMessage: string = '';
  subscription: any;
  currentUserId: string | null = null;

  constructor(private router: Router, private supabase: SupabaseService) {}

  async ngOnInit() {
    this.messages = await this.supabase.getRecentMessages();
    this.subscription = this.supabase.onNewMessages((newMsg) => { this.messages.push(newMsg);});
  }

  sendMessage() {
    if (this.newMessage.trim()) {
      this.supabase.sendMessage(this.newMessage).subscribe(resp => {
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

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }
}
