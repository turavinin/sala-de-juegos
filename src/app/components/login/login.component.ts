import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-login',
  imports: [MatCardModule, CommonModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule, RouterOutlet, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})


export class LoginComponent {
  loginForm: FormGroup;
  loading = false;

  private _user1Email = "kahiv74096@firain.com";
  private _user1Password = "123456";
  private _user2Email = "cesoro6932@exitings.com";
  private _user2Password = "123456";

  private _snackBarDuration = 6000;

  constructor(private fb: FormBuilder, 
              private supabase: SupabaseService, 
              private router: Router,
              private snackbar: MatSnackBar) {
    this.loginForm = this.createLoginForm();
  }

  get email() {
    return this.loginForm.get('email')!;
  }

  get password() {
    return this.loginForm.get('password')!;
  }

  onSubmit(): void {
    this.loading = true; 

    if (this.loginForm.invalid) {
      this.snackbar.open("Los datos ingresados son inválidos.", "Cerrar", { duration: this._snackBarDuration});
      return;
    }

    this.supabase.isValidLogin(this.loginForm.value.email, this.loginForm.value.password).subscribe(resp => {
      
      if (resp.success === false) {
        
        if (resp.message === "Email not confirmed") {
          this.snackbar.open("El email no ha sido confirmado. Por favor, revisa tu bandeja de entrada.", "Cerrar", { duration: this._snackBarDuration});
          this.loading = false; 
          return;
        }
        
        this.snackbar.open("Los datos ingresados son inválidos.", "Cerrar", { duration: this._snackBarDuration});
        this.loading = false; 
        return;
      }

      this.router.navigate(["home"]);
    });
  }

  setUserData(user: number): void {
    
    const userEmail = user === 1 ? this._user1Email : this._user2Email;
    const userPassword = user === 1 ? this._user1Password : this._user2Password;

    this.password.setValue(userPassword);
    this.email.setValue(userEmail);
  }

  private createLoginForm() {
    return this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }
}
