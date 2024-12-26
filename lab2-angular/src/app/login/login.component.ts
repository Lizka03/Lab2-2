import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClientModule } from '@angular/common/http';
import { HttpClient } from '@angular/common/http'; // Для HTTP-запросов
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    HttpClientModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    CommonModule,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  loginForm: FormGroup; // Форма для ввода логина и пароля
  isLoading = false; // Индикатор загрузки

  constructor(
    private fb: FormBuilder,
    private http: HttpClient, // Используем HttpClient для запросов
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    // Инициализация формы с валидацией
    this.loginForm = this.fb.group({
      login: ['', [Validators.required, Validators.minLength(3)]], // Логин обязателен и не короче 3 символов
      password: ['', [Validators.required, Validators.minLength(3)]], // Пароль обязателен и не короче 3 символов
    });
  }

  // Метод для обработки отправки формы
  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true; // Включаем индикатор загрузки
      const credentials = this.loginForm.value; // Получаем данные из формы

      // Выполняем POST-запрос на сервер
      this.http.post('http://localhost:5145/api/Auth/login', credentials).subscribe(
        (response: any) => {
          console.log('Успешный вход:', response);

          // Проверяем, возвращён ли токен
          if (response && response.Token) {
            // Сохраняем токен и логин в localStorage
            localStorage.setItem('Token', response.Token);
            localStorage.setItem('login', credentials.login); 
            localStorage.setItem('isAdmin', response.isAdmin ? 'true' : 'false'); // Сохраняем роль
            // Сохраняем логин
            window.dispatchEvent(new Event('authChange'));

            // Выводим уведомление об успешном входе
            this.snackBar.open('Вход выполнен успешно!', 'Закрыть', { duration: 3000 });

            // Перенаправляем пользователя на страницу профиля
            this.router.navigate(['/profile']);
          } else {
            // Если токен отсутствует, показываем ошибку
            this.snackBar.open('Ошибка: токен не получен', 'Закрыть', { duration: 3000 });
          }
          this.isLoading = false; // Выключаем индикатор загрузки
        },
        (error) => {
          // Обрабатываем ошибку при входе
          console.error('Ошибка входа:', error);
          this.snackBar.open('Ошибка входа: неверный логин или пароль', 'Закрыть', { duration: 3000 });
          this.isLoading = false; // Выключаем индикатор загрузки
        }
      );
    } else {
      // Если форма не валидна, выводим уведомление
      this.snackBar.open('Пожалуйста, проверьте введённые данные', 'Закрыть', { duration: 3000 });
    }
  }
}
