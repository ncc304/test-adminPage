import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

declare type LoginResponse = {
  token: string;
  statusCode: string;
};

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private httpClient: HttpClient) {}
  login(email: string, password: string): Observable<LoginResponse> {
    return this.httpClient
      .post<LoginResponse>(`${environment.apiUrl}/api/v1/auths/login`, {
        email,
        password,
      })
      .pipe(
        map(
          (response: LoginResponse) =>
            ({
              token: response.token,
              statusCode: response.statusCode,
            } as LoginResponse)
        )
      );
  }
}
