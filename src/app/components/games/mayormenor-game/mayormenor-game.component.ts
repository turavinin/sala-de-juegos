import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  trigger,
  state,
  style,
  animate,
  transition,
} from '@angular/animations';
import { Card } from '../../../models/card.model';
import { SupabaseService } from '../../../services/supabase.service';

@Component({
  selector: 'app-mayormenor-game',
  imports: [CommonModule],
  templateUrl: './mayormenor-game.component.html',
  styleUrl: './mayormenor-game.component.scss',
  animations: [
    trigger('flip', [
      state('cardA', style({ transform: 'rotateY(0)' })),
      state('cardB', style({ transform: 'rotateY(180deg)' })),
      transition('cardA <=> cardB', animate('600ms ease-in-out')),
    ]),
  ],
})


export class MayormenorGameComponent {
  deck: Card[] = [];
  cardA!: Card;
  cardB!: Card;
  score = 0;
  message = '';
  currentVisibleCart: 'cardA' | 'cardB' = 'cardA';
  game = 'Mayor o Menor';

  isLoading = false;
  showScoreAnimation = false;
  scoreAnimationText = '';
  scoreAnimationClass = '';

  constructor(private supabase: SupabaseService) {
    this.score = 0;
    this.resetGame();
  }

  resetGame() {
    this.deck = this.generateDeck();
    this.shuffleDeck();
    this.drawInitialCards();
  }

  generateDeck(): Card[] {
    const suits = ['♥', '♦', '♣', '♠'];
    const deck: Card[] = [];
    for (let value = 1; value <= 13; value++) {
      for (let suit of suits) {
        deck.push({ value, suit });
      }
    }
    return deck;
  }

  shuffleDeck() {
    for (let i = this.deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
    }
  }

  drawInitialCards() {
    this.cardA = this.deck.pop()!;
    this.cardB = this.deck.pop()!;
  }

  makeGuess(guess: 'higher' | 'lower') {
    this.isLoading = true;
    let userCard = this.currentVisibleCart === 'cardA' ? this.cardA : this.cardB;
    let opponentCard = this.currentVisibleCart === 'cardA' ? this.cardB : this.cardA;
    this.currentVisibleCart = this.currentVisibleCart === 'cardA' ? 'cardB' : 'cardA';

    const isCorrect =
      (guess === 'higher' && userCard.value < opponentCard.value) ||
      (guess === 'lower' && userCard.value > opponentCard.value);

    if (userCard.value == opponentCard.value) {
      console.log('Empate');
      this.triggerScoreAnimation('¡Empate!', 'draw');
    } else if (isCorrect) {
      this.score++;
      this.triggerScoreAnimation('¡Correcto! +1', 'correct');
    } else {
      if (this.score > 0) this.score--;
      this.triggerScoreAnimation('¡Incorrecto!', 'incorrect');
    }

    setTimeout(() => {

      if (this.currentVisibleCart === 'cardB') {
        this.cardA = this.deck.pop()!;
        userCard = this.cardB;
      } else {
        this.cardB = this.deck.pop()!;
        opponentCard = this.cardA;
      }

      if (this.deck.length === 0) {
        this.resetGame();
      }

      this.isLoading = false;

    }, 1000);
  }

  triggerScoreAnimation(text: string, type: 'correct' | 'incorrect' | 'draw'): void {
    this.scoreAnimationText = text;
    this.scoreAnimationClass = type;
    this.showScoreAnimation = true;

    setTimeout(() => {
      this.showScoreAnimation = false;
    }, 1000);
  }

  getSuitClass(suit: string): string {
    if (suit === '♥' || suit === '♦') {
      return 'red-suit';
    } else if (suit === '♣' || suit === '♠') {
      return 'black-suit';
    }
    return '';
  }

  ngOnDestroy(): void {
    if (this.score > 0) {
      this.supabase.saveGamePoints(this.score, this.game).subscribe((resp) => {
        if (resp.success) {
          // console.log('Puntos guardados correctamente');
        } else {
          console.error('Error al guardar los puntos:', resp.message);
        }
      });
    }
  }
}