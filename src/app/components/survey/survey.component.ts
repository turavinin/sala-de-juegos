import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-survey',
  imports: [MatCardModule, CommonModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, 
    ReactiveFormsModule, MatRadioModule , RouterModule, MatCheckboxModule, MatSelectModule, MatProgressSpinnerModule ],
  templateUrl: './survey.component.html',
  styleUrl: './survey.component.scss'
})
export class SurveyComponent {
  surveyForm: FormGroup;
  loading = false;
  checkboxOptions = [
    'La encontré en la web',
    'Me pasaron la página',
    'No recuerdo'
  ];

  constructor(private fb: FormBuilder, private router: Router, private supabaseService: SupabaseService, private snackbar: MatSnackBar) {
    this.surveyForm = this._createSurveyForm();
  }

  atLeastOneCheckboxChecked(group: FormGroup) {
    return Object.values(group.controls).some(control => control.value)
      ? null
      : { required: true };
  }

  onSubmit() {
    this.loading = true;

    if (this.surveyForm.valid) {

      const formData = this.surveyForm.value;
      const question2Answers = Object.keys(formData.question2).filter(key => formData.question2[key]);
      const surveyData = {
        firstname: formData.firstname,
        lastname: formData.lastname,
        age: formData.age,
        phone: formData.phone,
        likeGames: formData.question1 === '1' ?  true : false,
        know: question2Answers.join(', '),
        recommend: formData.recommendation === '1' ?  true : false,
      };

      this.supabaseService.createSurvey(surveyData).subscribe(result => {
        if (result.success) {
          this.snackbar.open("Encuesta enviada con éxito", "Cerrar", { duration: 6000});
          this.router.navigate(['home']);
        } else {
          this.snackbar.open("Error el enviar la encuesta", "Cerrar", { duration: 6000});
          this.loading = false;
          this.surveyForm.reset();
        }
      });
    }
  }

  onCancel() {
    this.surveyForm.reset();
    this.router.navigate(['home']);
  }

  get firstname() {
    return this.surveyForm.get('firstname')!;
  }

  get lastname() {
    return this.surveyForm.get('lastname')!;
  }

  get age() {
    return this.surveyForm.get('age')!;
  }

  get phone() {
    return this.surveyForm.get('phone')!;
  }

  get question1() {
    return this.surveyForm.get('question1')!;
  }

  get question2() {
    return this.surveyForm.get('question2')!;
  }

  get recommendation() {
    return this.surveyForm.get('recommendation')!;
  }

  private _createSurveyForm(): FormGroup {
    return this.fb.group(
      {
        firstname: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(50), Validators.pattern(/^[a-zA-Z\s]+$/)]],
        lastname: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(50), Validators.pattern(/^[a-zA-Z\s]+$/)]],
        age: ['', [Validators.required, Validators.min(18), Validators.max(99), Validators.pattern(/^[0-9]+$/)]],
        phone: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(10), Validators.pattern(/^[0-9]+$/)]],
        question1: ['', [Validators.required]],
        question2: this.fb.group({
          option1: [false],
          option2: [false],
          option3: [false]
        }, { validators: this.atLeastOneCheckboxChecked }),
        recommendation: ['', [Validators.required]],
      });
  }
}