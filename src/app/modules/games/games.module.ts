import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GamesRoutingModule } from './games-routing.module';
import { PreguntadosGameComponent } from '../../components/games/preguntados-game/preguntados-game.component';
import { TragamonedasGameComponent } from '../../components/games/tragamonedas-game/tragamonedas-game.component';
import { MayormenorGameComponent } from '../../components/games/mayormenor-game/mayormenor-game.component';
import { AhoracadoGameComponent } from '../../components/games/ahoracado-game/ahoracado-game.component';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    GamesRoutingModule,
    PreguntadosGameComponent,
    TragamonedasGameComponent,
    MayormenorGameComponent,
    AhoracadoGameComponent
  ]
})
export class GamesModule { }
