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
import { CasinoIcon } from '../../../models/casino-icon.model';

@Component({
  selector: 'app-tragamonedas-game',
  imports: [CommonModule],
  templateUrl: './tragamonedas-game.component.html',
  styleUrl: './tragamonedas-game.component.scss',
  animations: [
    trigger('flip', [
      state('sideA', style({ transform: 'rotateY(0)' })),
      state('sideB', style({ transform: 'rotateY(180deg)' })),
      transition('sideA <=> sideB', animate('600ms ease-in-out')),
    ]),
  ],
})
export class TragamonedasGameComponent {

  currentVisibleCart: 'sideA' | 'sideB' = 'sideA';
  isLoading = false;

  icons: CasinoIcon[] = [];
  cards: Card[] = [{}, {}, {}, {}, {}] as Card[];

  sideA: Card[] = [{}, {}, {}, {}, {}] as Card[];
  sideB: Card[] = [{}, {}, {}, {}, {}] as Card[];

  constructor() {
    this.generateIcons();
    this.startGame();

    console.log(this.cards);
  }

  play() {
    this.currentVisibleCart = this.currentVisibleCart === 'sideA' ? 'sideB' : 'sideA';


  }

  onFlipDone() {
    if (this.currentVisibleCart === 'sideB') {
      this.sideA = this.shuffleDeck();
    }
    else {
      this.sideB = this.shuffleDeck();
    }
  }

  private startGame() {
    this.shuffleDecks();
  }

  private shuffleDecks() {
    for (let i = 0; i < this.cards.length; i++) {
      this.cards[i] = this.getRandomIcon();
      this.sideA[i] = this.getRandomIcon();
      this.sideB[i] = this.getRandomIcon();
    }
  }

  private shuffleDeck() {
    return Array.from({ length: 5 }, () => this.getRandomIcon());
  }

  private getRandomIcon(): Card {
    const randomIndex = Math.floor(Math.random() * this.icons.length);
    const randomIcon = this.icons[randomIndex];
    return {
      value: randomIcon.id, suit: randomIcon.path,
    };
  }

  private generateIcons(): void {
    this.icons = Array.from({ length: 27 }, (_, i) => ({
      id: i + 1,
      path: `/icons/${i + 1}.svg`
    }));
  }

}
