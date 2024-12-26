import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatToolbarModule } from '@angular/material/toolbar';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-home',
  imports: [ MatToolbarModule,HttpClientModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  mostRentedAuthor: string = ''; // Переменная для хранения имени автора

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.getMostRentedAuthor(); // Вызов метода при инициализации компонента
  }

  getMostRentedAuthor(): void {
    this.http.get<{ Author: string; RentedBookCount: number }>('http://localhost:5145/api/Book/most-rented-author')
      .subscribe({
        next: (response) => {
          if (response && response.Author) {
            this.mostRentedAuthor = `${response.Author} (${response.RentedBookCount} аренды)`;
          } else {
            this.mostRentedAuthor = 'Нет данных'; // Если API вернул пустой объект
          }
        },
        error: (err) => {
          console.error('Ошибка при получении данных:', err);
          this.mostRentedAuthor = 'Ошибка при загрузке данных'; // Ошибка запроса
        }
      });
  }
  
  
}
