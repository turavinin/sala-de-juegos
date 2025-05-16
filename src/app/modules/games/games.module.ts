import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GamesRoutingModule } from './games-routing.module';
import { PreguntadosGameComponent } from '../../components/games/preguntados-game/preguntados-game.component';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    GamesRoutingModule,
    PreguntadosGameComponent
  ]
})
export class GamesModule { }
