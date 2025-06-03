import { Component } from '@angular/core';
import { Country } from '../../../models/country.model';
import { Question } from '../../../models/question.model';
import { CountryService } from '../../../services/country.service';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { delay } from 'rxjs';
import { SupabaseService } from '../../../services/supabase.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-preguntados-game',
  imports: [CommonModule, MatCardModule, MatProgressSpinnerModule],
  templateUrl: './preguntados-game.component.html',
  styleUrl: './preguntados-game.component.scss',
})
export class PreguntadosGameComponent {
  options: Country[] = [];
  correct?: Country;
  question?: Question;
  flagUrl: string = '';
  showScoreAnimation = false;
  scoreAnimationText = '';
  scoreAnimationClass = '';
  isLoading = false;
  points = 0;
  game = 'Preguntados';


  constructor(private router: Router,private countryService: CountryService, private supabase: SupabaseService) {}

  ngOnInit(): void {
    this.loadNewQuestion();
  }

  loadNewQuestion(): void {
    this.isLoading = true;
    this.countryService.getQuestion().subscribe((q) => {
      this.question = q;
    });
  }

  selectOption(option: Country) {
    if (option.code === this.question?.correct.code) {
      this.points++;
      this.triggerScoreAnimation('¡Correcto! +1', 'correct');
    } else {
      this.triggerScoreAnimation('¡Incorrecto!', 'incorrect');
    }

    this.loadNewQuestion();
  }

  triggerScoreAnimation(text: string, type: 'correct' | 'incorrect'): void {
    this.scoreAnimationText = text;
    this.scoreAnimationClass = type;
    this.showScoreAnimation = true;

    setTimeout(() => {
      this.showScoreAnimation = false;
    }, 1000);
  }

  onImageLoad(): void {
    this.isLoading = false;
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
