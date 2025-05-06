import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { AboutComponent } from './components/about/about.component';
import { LoginComponent } from './components/login/login.component';
import { LayoutComponent } from './components/layout/layout.component';

export const routes: Routes = [
    { path: '', loadComponent: () => import('./components/layout/layout.component').then(m => m.LayoutComponent),
        children: [ 
            { path: '', redirectTo: '/login', pathMatch: 'full' },
            { path: 'home', loadComponent: () => import('./components/home/home.component').then(m => m.HomeComponent) },
            { path: 'about', loadComponent: () => import('./components/about/about.component').then(m => m.AboutComponent) }
        ]
      },
    { path: 'login', loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent) },
    { path: 'register', loadComponent: () => import('./components/register/register.component').then(m => m.RegisterComponent) },
    { path: '**', loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent) }
];



// export const routes: Routes = [
//     { path: '', redirectTo: '/login', pathMatch: 'full' },
//     { path: 'home', loadComponent: () => import('./components/home/home.component').then(m => m.HomeComponent) },
//     { path: 'login', loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent) },
//     { path: 'register', loadComponent: () => import('./components/register/register.component').then(m => m.RegisterComponent) },
//     { path: 'about', loadComponent: () => import('./components/about/about.component').then(m => m.AboutComponent) },
//     { path: '**', loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent) }
// ];