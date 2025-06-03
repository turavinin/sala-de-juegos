import { Component, OnInit } from '@angular/core';
import { SupabaseService } from '../../services/supabase.service';
import { Results } from '../../models/results.model';
import { MatListModule } from '@angular/material/list';
import { MatExpansionModule } from '@angular/material/expansion';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-results',
  imports: [CommonModule, MatListModule, MatExpansionModule],
  templateUrl: './results.component.html',
  styleUrl: './results.component.scss'
})
export class ResultsComponent implements OnInit {

  allResults: any[] = [];
  leaderboard: { [key: string]: any[] } = {};

  constructor(private supabase: SupabaseService) { }



  async ngOnInit() {
    this.allResults = await this.supabase.getAllResults();
    this.processLeaderboard();
  }

  processLeaderboard() {
    const grouped: { [key: string]: { [authId: string]: any } } = {};

    for (const result of this.allResults) {
      const game = result.game;
      const id = result.auth_id;
      const name = result.user_info.name;

      if (!grouped[game]) grouped[game] = {};
      if (!grouped[game][id]) grouped[game][id] = { name, total: 0 };

      grouped[game][id].total += result.points;
    }

    for (const game in grouped) {
      this.leaderboard[game] = Object.values(grouped[game])
        .sort((a: any, b: any) => b.total - a.total);
    }
  }

}
