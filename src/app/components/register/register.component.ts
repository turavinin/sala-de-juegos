import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-register',
  imports: [MatCardModule, MatButtonModule, MatIconModule, MatFormFieldModule, 
    MatInputModule, CommonModule, ReactiveFormsModule, RouterModule, MatProgressSpinnerModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})

export class RegisterComponent {
  registerForm: FormGroup;

  loading = false;

  constructor(private fb: FormBuilder, 
              private supabaseService: SupabaseService, 
              private router: Router,
              private snackbar: MatSnackBar) {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      name: ['', [Validators.required, Validators.minLength(3), Validators.pattern(/^[a-zA-Z ]*$/)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  get email() {
    return this.registerForm.get('email')!;
  }

  get password() {
    return this.registerForm.get('password')!;
  }

  get name() {
    return this.registerForm.get('name')!;
  }

  async onSubmit(): Promise<void> {
    this.loading = true;

    if (this.registerForm.valid) {
      this.supabaseService.createUser(this.registerForm.value.email, 
                                                this.registerForm.value.password, 
                                                this.registerForm.value.name)
                                                .subscribe(result => {
                                                
        if (result.success === true) { this.router.navigate(["login"]) };

        if (result.success === false) {
          this.loading = false;
          this.registerForm.reset();

          if (result.message === "User already exists") { this.snackbar.open("El usuario ya existe.", "Cerrar", { duration: 6000}); }
          else { this.snackbar.open("Error al crear el usuario. Intente nuevamente.", "Cerrar", { duration: 6000}); }
        }
      })
    }
  }

  onCancel() {
    this.registerForm.reset();
    this.router.navigate(['login']);
  }
}