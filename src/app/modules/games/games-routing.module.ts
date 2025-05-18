import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', loadComponent: () => import('../../components/home/home.component').then(m => m.HomeComponent) },
  { path: 'preguntados', loadComponent: () => import('../../components/games/preguntados-game/preguntados-game.component').then(m => m.PreguntadosGameComponent) },
  { path: 'ahorcado', loadComponent: () => import('../../components/games/ahoracado-game/ahoracado-game.component').then(m => m.AhoracadoGameComponent) },
  { path: 'mayor-menor', loadComponent: () => import('../../components/games/mayormenor-game/mayormenor-game.component').then(m => m.MayormenorGameComponent) },
  { path: 'tragamonedas', loadComponent: () => import('../../components/games/tragamonedas-game/tragamonedas-game.component').then(m => m.TragamonedasGameComponent) },
  { path: '**', loadComponent: () => import('../../components/home/home.component').then(m => m.HomeComponent) }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GamesRoutingModule { }
