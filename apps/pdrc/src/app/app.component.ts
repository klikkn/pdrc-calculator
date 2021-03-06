import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Message } from '@pdrc/api-interfaces';

@Component({
  selector: 'pdrc-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  hello$ = this.http.get<Message>('/api/config');
  constructor(private http: HttpClient) {}
}
