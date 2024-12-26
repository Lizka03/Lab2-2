import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table'; // Подключаем MatTableModule
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-admin-books',
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatTableModule,
    MatSort,
    MatCheckboxModule,
    MatInputModule,
    FormsModule,
    HttpClientModule
  ],
  templateUrl: './admin-books.component.html',
  styleUrls: ['./admin-books.component.css'],
})
export class AdminBooksComponent implements OnInit {
  books: any[] = []; // Полный список книг
  dataSource = new MatTableDataSource<any>(); // Источник данных для таблицы
  users: any[] = []; // Пользователи
  authors: any[] = []; // Авторы
  displayedColumns: string[] = ['title', 'authors', 'status', 'rentedBy', 'rentalDate','returnDate','delete', 'edit'];

  searchTerm: string = ''; // Фильтрация по названию
  sortBy: string = ''; // Поле для сортировки
  sortDirection: 'asc' | 'desc' = 'asc'; // Направление сортировки
  editedBookIndex: number | null = null; // Индекс редактируемой книги
  editedBook: any = {}; // Объект редактируемой книги

  // Переменная для новой книги
  newBook: any = {
    Title: '', // Название книги
    Authors: [], // Список авторов
    IsAvailable: true, // Статус доступности
    RentedByUserId: null, // Арендатор
  };
  @ViewChild(MatSort) sort!: MatSort; // Сортировка для Angular Material таблицы

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.getAllData();
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort; // Подключение сортировки
  }

  getAllData(): void {
    const booksRequest = this.http.get('http://localhost:5145/api/Book');
    const usersRequest = this.http.get('http://localhost:5145/api/User');
    const authorsRequest = this.http.get('http://localhost:5145/api/Author');
  
    Promise.all([booksRequest.toPromise(), usersRequest.toPromise(), authorsRequest.toPromise()])
      .then(([books, users, authors]: any) => {
        this.users = users;
        this.authors = authors;
  
        this.books = books.map((book: any) => ({
          ...book,
          authorsNames: this.getAuthorsNamesByIds(book.Authors),
          rentedByUserName: users.find((user: any) => user.Id === book.RentedByUserId)?.Username || 'Нет арендатора',
          rentalDate: book.DateRented ? new Date(book.DateRented).toLocaleDateString() : 'Не указана', // Добавляем дату аренды
          returnDate: book.DueDate ? new Date(book.DueDate).toLocaleDateString() : 'Не указана', // Добавляем дату возврата
        }));
  
        this.dataSource.data = this.books; // Привязка к MatTableDataSource
        this.dataSource.sort = this.sort; // Привязка сортировки
        
      })
      .catch((error) => console.error('Ошибка загрузки данных:', error));
  }
  

  getAuthorsNamesByIds(authorIds: number[]): string {
    if (!authorIds || authorIds.length === 0) return 'Нет авторов';
    return this.authors
      .filter((author) => authorIds.includes(author.Id))
      .map((author) => author.Name)
      .join(', ');
  }

  getAuthorNames(authors: any[]): string {
    return authors?.length > 0 ? authors.map((author) => author.Name).join(', ') : 'Нет авторов';
  }

  // Фильтрация данных
  applyFilter(): void {
    this.dataSource.filter = this.searchTerm.trim().toLowerCase();
  }
  

  // Сортировка данных
  onSort(field: string): void {
    if (this.sortBy === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = field;
      this.sortDirection = 'asc';
    }

    const directionMultiplier = this.sortDirection === 'asc' ? 1 : -1;

    this.books.sort((a, b) => {
      const valueA = a[field] || '';
      const valueB = b[field] || '';

      if (valueA < valueB) return -1 * directionMultiplier;
      if (valueA > valueB) return 1 * directionMultiplier;
      return 0;
    });

    this.updateDataSource(); // Обновляем данные таблицы
  }

  updateDataSource(): void {
    const filteredBooks = this.searchTerm
      ? this.books.filter((book) =>
          book.Title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          this.getAuthorNames(book.Authors).toLowerCase().includes(this.searchTerm.toLowerCase())
        )
      : this.books;

    this.dataSource.data = filteredBooks; // Обновляем таблицу с учетом фильтрации
  }

  addBook(): void {
    if (!this.newBook.Title.trim()) {
      alert('Название книги обязательно!');
      return;
    }

    const book = {
      title: this.newBook.Title.trim(),
      isAvailable: this.newBook.IsAvailable,
      authors: this.newBook.Authors.map((author: any) => ({
        name: author.name,
      })),
    };

    this.http.post('http://localhost:5145/api/Book', book).subscribe({
      next: (response: any) => {
        alert('Книга успешно добавлена!');
        this.getAllData(); // Обновляем данные
        this.resetNewBook();
      },
      error: (err) => {
        console.error('Ошибка при добавлении книги:', err);
        alert('Не удалось добавить книгу.');
      },
    });
  }

  resetNewBook(): void {
    this.newBook = {
      Title: '',
      Authors: [],
      IsAvailable: true,
      RentedByUserId: null,
    };
  }

  onAuthorsChange(event: Event): void {
    const input = (event.target as HTMLInputElement).value;
    this.newBook.Authors = input.split(',').map((name: string) => ({ name: name.trim() }));
  }

  deleteBook(bookId: number): void {
    const confirmDelete = confirm('Вы уверены, что хотите удалить эту книгу?');
    if (!confirmDelete) return;

    this.http.delete(`http://localhost:5145/api/Book/${bookId}`, { responseType: 'text' }).subscribe({
      next: () => {
        alert('Книга успешно удалена!');
        this.getAllData(); // Обновляем данные
      },
      error: (err) => {
        console.error('Ошибка при удалении книги:', err);
        alert('Не удалось удалить книгу.');
      },
    });
  }

  startEditing(index: number, book: any): void {
    this.editedBookIndex = index;
    this.editedBook = {
      ...book,
      Authors: book.Authors.map((author: any) => author.Name).join(', '),
    };
  }

  cancelEditing(): void {
    this.editedBookIndex = null;
    this.editedBook = {};
  }

  saveEdit(bookId: number): void {
    const url = `http://localhost:5145/api/Book/${bookId}`;
  
    // Преобразуем строку авторов обратно в массив объектов
    const updatedBook = {
      ...this.books[this.editedBookIndex!], // Сохраняем существующие поля книги
      Title: this.editedBook.Title, // Обновляем только изменённые поля
      IsAvailable: this.editedBook.IsAvailable,
      Authors: this.editedBook.Authors.split(',').map((name: string, index: number) => ({
        Id: this.books[this.editedBookIndex!].Authors[index]?.Id || 0, // Если ID автора недоступен, укажите 0
        Name: name.trim(),
      })),
    };
  
    this.http.put(url, updatedBook).subscribe({
      next: () => {
        alert('Книга успешно обновлена!');
        this.books[this.editedBookIndex!] = { ...updatedBook }; // Локальное обновление книги
        this.dataSource.data = [...this.books]; // Обновляем источник данных таблицы
        this.cancelEditing(); // Завершаем редактирование
      },
      error: (err) => {
        console.error('Ошибка при обновлении книги:', err);
        alert('Не удалось обновить книгу.');
      },
    });
  }
  
  
}
