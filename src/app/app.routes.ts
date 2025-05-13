import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { AboutComponent } from './components/about/about.component';
import { LoginComponent } from './components/login/login.component';
import { LayoutComponent } from './components/layout/layout.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
    { path: '', loadComponent: () => import('./components/layout/layout.component').then(m => m.LayoutComponent), canActivate: [AuthGuard],
        children: [ 
            { path: '', redirectTo: '/login', pathMatch: 'full' },
            { path: 'home', loadComponent: () => import('./components/home/home.component').then(m => m.HomeComponent), canActivate: [AuthGuard] },
            { path: 'about', loadComponent: () => import('./components/about/about.component').then(m => m.AboutComponent), canActivate: [AuthGuard] }
        ]
      },
    { path: 'login', loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent) },
    { path: 'register', loadComponent: () => import('./components/register/register.component').then(m => m.RegisterComponent) },
    { path: '**', loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent) }
];