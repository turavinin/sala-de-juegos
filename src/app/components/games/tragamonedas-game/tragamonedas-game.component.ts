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
import { GamesRoutingModule } from '../../../modules/games/games-routing.module';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tragamonedas-game',
  imports: [CommonModule,
    GamesRoutingModule,
    MatFormFieldModule,
    MatInputModule, FormsModule],
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
  betPlayer = false;

  icons: CasinoIcon[] = [];
  cards: Card[] = [{}, {}, {}, {}, {}] as Card[];

  sideA: Card[] = [{}, {}, {}, {}, {}] as Card[];
  sideB: Card[] = [{}, {}, {}, {}, {}] as Card[];

  game = 'Tragamonedas';

  playerPoints: number = 0;
  currentBet: number = 0;
  finalResult: number = 0;

  showScoreAnimation = false;
  scoreAnimationText = '';
  scoreAnimationClass = '';

  constructor(private router: Router, private supabase: SupabaseService) {
  }

  async ngOnInit() {
    this.startGame();
  }

  play() {
    this.isLoading = true;
    this.betPlayer = true;
    this.changeCardSide();


    setTimeout(() => {
      const currentDeck = this.getCurrentDeck();
      const mostRepeated = this.getMaxRepetitionsAndValues(currentDeck);
      const betStatus = this.getBetStatus(mostRepeated);

      if (betStatus.status === 1) {
        this.triggerScoreAnimation(betStatus.message, 'correct');
      }
      else if (betStatus.status === 2) {
        this.triggerScoreAnimation(betStatus.message, 'incorrect');
      }
      else if (betStatus.status === 3) {
        this.triggerScoreAnimation(betStatus.message, 'draw');
      }
      else {
        this.triggerScoreAnimation(betStatus.message, 'draw');
      }

      this.isLoading = false;
    }, 1000);
  }

  onFlipDone() {
    if (this.currentVisibleCart === 'sideB') {
      this.sideA = this.shuffleDeck();
    }
    else {
      this.sideB = this.shuffleDeck();
    }
  }

  private async startGame() {
    this.generateIcons();
    this.shuffleDecks();

    await this.setPlayerPoints();
  }

  private shuffleDecks() {
    for (let i = 0; i < 5; i++) {
      this.sideA[i] = this.getRandomIcon();
      this.sideB[i] = this.getRandomIcon();
    }
  }

  private shuffleDeck(): Card[] {
    
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
    const randomNumber = Math.floor(Math.random() * 10) + 3; 
    this.icons = Array.from({ length: randomNumber }, (_, i) => ({
      id: i + 1,
      path: `/icons/${i + 1}.svg`
    }));
  }

  private getPlayerPoints() {
    return this.supabase.getUserPoints();
  }

  async setPlayerPoints() {
    this.playerPoints = await this.getPlayerPoints() || 0;
    if (this.playerPoints === null || this.playerPoints < 0) {
      this.playerPoints = 0;
    }
  }

  private changeCardSide() {
    this.currentVisibleCart = this.currentVisibleCart === 'sideA' ? 'sideB' : 'sideA';
  }

  private getCurrentDeck() {
    if (this.currentVisibleCart === 'sideA') {
      return this.sideA;
    } else {
      return this.sideB;
    }
  }

  private getMaxRepetitionsAndValues(deck: Card[]): { maxCount: number, values: number[] } {
    const repetitions = deck.reduce((acc, card) => {
      acc[card.value] = (acc[card.value] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    const maxCount = Math.max(...Object.values(repetitions), 0);

    // Valores que tienen esa máxima cantidad de repeticiones
    const values = Object.entries(repetitions)
      .filter(([_, count]) => count === maxCount)
      .map(([valueStr, _]) => Number(valueStr));


    // Si no hay repeticiones, devolver un array vacío
    if (maxCount <= 1) {
      return { maxCount: 0, values: [] };
    }

    return { maxCount, values };
  }

  private getBetStatus(mostRepeated: any) {
    const { maxCount, values } = mostRepeated;

    if (maxCount === 0 || maxCount === 1) {
      this.playerPoints = this.playerPoints - this.currentBet;
      this.finalResult = this.finalResult - this.currentBet;
      return { status: 2, message: '¡Perdiste ' + this.currentBet + ' puntos!' };
    }

    if (maxCount === 2) {
      return { status: 3, message: 'Todo sigue igual' };
    }

    if (maxCount === 3) {
      this.playerPoints = this.playerPoints + (this.currentBet * 0.25);
      this.finalResult = this.finalResult + (this.currentBet * 0.25);
      return { status: 1, message: '¡Ganaste ' + (this.currentBet * 0.25) + ' puntos!' };
    }

    if (maxCount === 4) {
      this.playerPoints = this.playerPoints + (this.currentBet * 0.5);
      this.finalResult = this.finalResult + (this.currentBet * 0.5);
      return { status: 1, message: '¡Ganaste ' + (this.currentBet * 0.5) + ' puntos!' };
    }

    if (maxCount === 5) {
      this.playerPoints = this.playerPoints + (this.currentBet * 1);
      this.finalResult = this.finalResult + (this.currentBet * 1);
      return { status: 1, message: '¡Ganaste ' + (this.currentBet * 1) + ' puntos!' };
    }

    return { status: 4, message: ':O' };
  }

  triggerScoreAnimation(text: string, type: 'correct' | 'incorrect' | 'draw'): void {
    this.scoreAnimationText = text;
    this.scoreAnimationClass = type;
    this.showScoreAnimation = true;

    setTimeout(() => {
      this.showScoreAnimation = false;
    }, 1000);
  }

  goHome(){
    if (this.betPlayer && this.finalResult !== 0) {
      this.supabase.saveGamePoints(this.finalResult, this.game).subscribe((resp) => {
        if (resp.success) {
          // console.log('Puntos guardados correctamente');
          this.router.navigate(['/home']);
        } else {
          console.error('Error al guardar los puntos:', resp.message);
          this.router.navigate(['/home']);
        }
      });
    } else {
      this.router.navigate(['/home']);
    }
  }
}
