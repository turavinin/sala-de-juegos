import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatGridListModule } from '@angular/material/grid-list';
import { HttpClient } from '@angular/common/http';
import { SupabaseService } from '../../../services/supabase.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-ahoracado-game',
  imports: [MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatGridListModule,
    CommonModule],
  templateUrl: './ahoracado-game.component.html',
  styleUrl: './ahoracado-game.component.scss'
})
export class AhoracadoGameComponent implements OnInit {
  wordList: string[] = [];
  word: string = '';
  guessedLetters: string[] = [];

  fails = 0;
  maxFails = 6;
  points = 0;

  game = 'Ahorcado';

  constructor(private router: Router, private http: HttpClient, private supabase: SupabaseService) {
  }

  ngOnInit(): void {
    this.http.get<{ words: string[] }>('/palabras_ahorcado.json').subscribe(data => {
      this.wordList = data.words;
      this.resetGame();
    });
  }

  get displayWord(): string[] {
    return this.word.split('').map(letter =>
      this.guessedLetters.includes(letter) ? letter : '_'
    );
  }

  get isGameOver(): boolean {
    return this.fails >= this.maxFails || this.displayWord.join('') === this.word;
  }

  get isWinner(): boolean {
    return this.displayWord.join('') === this.word;
  }

  guess(letter: string): void {
    if (this.isGameOver || this.guessedLetters.includes(letter)) return;

    this.guessedLetters.push(letter);

    if (!this.word.includes(letter)) {
      this.fails++;
    } else {
      for (let i = 0; i < this.word.length; i++) {
        if (this.word[i] === letter) {
          this.displayWord[i] = letter;
        }
      }
    }

    if (this.isGameOver) {
      this.onGameEnd();
    }
  }

  resetGame(): void {
    this.word = this.getRandomWord().toUpperCase();
    console.log(this.word);
    this.guessedLetters = [];
    this.fails = 0;
  }

  getRandomWord(): string {
    const index = Math.floor(Math.random() * this.wordList.length);
    return this.wordList[index];
  }

  onGameEnd(): void {
    if (this.isWinner) {
      this.points += 10;
    }
  }

  goHome() {
    if (this.points > 0) {
      this.supabase.saveGamePoints(this.points, this.game).subscribe((resp) => {
        if (resp.success) {
        } else {
          console.error('Error al guardar los puntos:', resp.message);
        }

        this.router.navigate(['/home']);
      });
    } else {
      this.router.navigate(['/home']);
    }
  }
}