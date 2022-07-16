import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { RxState } from '@rx-angular/state';
import {
  catchError,
  filter,
  Observable,
  of,
  Subject,
  mergeMap,
  tap,
} from 'rxjs';
import { AuthenticateService, UserService } from 'src/app/services';
import { LoginState } from './states';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  providers: [RxState],
})
export class LoginComponent implements OnInit {
  form!: FormGroup;
  onSubmit = new Subject<void>();
  onSubmitHandler$ = new Subject<{ username: string; password: string }>();
  get state$(): Observable<LoginState> {
    return this.state.select();
  }

  constructor(
    private userService: UserService,
    private authService: AuthenticateService,
    private fb: FormBuilder,
    private router: Router,
    private state: RxState<LoginState>
  ) {
    this.state.set({
      hasError: false,
    });
  }

  ngOnInit(): void {
    this.initForm();
    this.manageEvents();
    this.connectState();
  }

  initForm(): void {
    this.form = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });
  }
  private connectState() {
    const handler$ = this.onSubmitHandler$.pipe(
      mergeMap((data) =>
        this.userService.login(data.username, data.password).pipe(
          catchError((err: { statusCode: string }) =>
            of({
              statusCode: err.statusCode,
              token: '',
            })
          )
        )
      )
    );
    // this.state.connect(handler$, (prev, curr) => ({
    //   ...prev,
    //   hasError: !curr.token,
    //   token: curr.token,
    // }));
    this.state.connect(handler$, (prev, curr) => {
      console.log(curr);
      console.log(curr.token);

      return {
        ...prev,
        hasError: !curr.token,
        token: curr.token,
      };
    });

    this.state
      .select('token')
      .pipe(tap((data) => console.log(data)))
      .pipe(filter((x) => !!x))
      .subscribe({
        next: (token) => {
          this.router.navigate(['/']);
          this.authService.persistToken(token);
        },
      });
  }

  private manageEvents() {
    this.state.hold(this.onSubmit, () => {
      const valid = this.form.valid;
      this.state.set({
        hasError: !valid,
      });
      if (!valid) {
        return;
      }
      this.onSubmitHandler$.next({
        username: this.form.value.username,
        password: this.form.value.password,
      });
    });
  }
}
