import { Component , NgModule, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import {Observable, map, startWith,catchError,of, BehaviorSubject} from 'rxjs'
import { RouterOutlet } from '@angular/router';
import { ServerService } from './service/server.service';
import { AppState } from './interface/app.state';
import { CustomResponse } from './interface/custom-reponse';
import { DataState } from './enums/data.state.enum';
import { HttpClientModule } from '@angular/common/http';
import { Status } from './enums/status.enum';
import { NgForm, FormsModule } from '@angular/forms';
import { Server } from './interface/server';



@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HttpClientModule,FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  providers: [ServerService]
  
})
export class AppComponent implements OnInit{
  appState$: Observable<AppState<CustomResponse>>;

  pingSubject = new BehaviorSubject<string>('');
  dataSubject = new BehaviorSubject<CustomResponse | null>(null);
  pingStatus$ = this.pingSubject.asObservable();
  isLoading = new BehaviorSubject<boolean>(false);
  isLoading$ = this.isLoading.asObservable()

  readonly DataState = DataState;
  readonly Status = Status;
  constructor(private serverService: ServerService ) {}


  ngOnInit(): void {
    this.appState$ = this.serverService.servers$
      .pipe(
        map(response => {
          this.dataSubject.next(response);
          return {
            dataState: DataState.LOADED_STATE,
            appData: response
          };
        }),
        startWith({
          dataState: DataState.LOADING_STATE
        }),
        catchError((error: string) => {
          return of({
            dataState: DataState.ERROR_STATE,
            error
          });
        })
      );
  }

  pingServer(ipAddress: string): void {
    this.pingSubject.next(ipAddress);
    this.appState$ = this.serverService.ping$(ipAddress)
    .pipe(
      map(response => {
        const index =  this.dataSubject.value.data.servers?.findIndex((server) => server.id === response.data.server?.id)
        this.dataSubject.value.data.servers[index] = response.data.server;
        this.pingSubject.next('')
        return {
          dataState: DataState.LOADED_STATE,
          appData: this.dataSubject.value
        };
        
      }),
      startWith({
        dataState: DataState.LOADED_STATE,
        appData: this.dataSubject.value
      }),
      catchError((error: string) => {
        this.pingSubject.next('')
        return of({
          dataState: DataState.ERROR_STATE,
          error
        });
      })
    );
         
  }

  filterServers(event: any):void {
    const selectedValue = event.target.value;
    console.log('Selected value:', selectedValue);

     this.appState$ = this.serverService.filter$(selectedValue, this.dataSubject.value)
    .pipe(
      map(response => {
        return {
          dataState: DataState.LOADED_STATE,
          appData: response
        };
      }),
      startWith({
        dataState: DataState.LOADING_STATE
      }),
      catchError((error: string) => {
        return of({
          dataState: DataState.ERROR_STATE,
          error
        });
      })
    ) 
  }

  saveServer(serverForm: NgForm):void {
    this.isLoading.next(true)
    this.appState$ = this.serverService.save$(serverForm.value as Server)
    .pipe(
      map(response => {
         this.dataSubject.next({
          ...response,
            data: {
              servers: [
                response.data.server,
                ...this.dataSubject.value.data.servers
              ]
            }
         });

         document.getElementById("closeModal").click();
         this.isLoading.next(false)
         serverForm.reset();
         return {
          dataState: DataState.LOADED_STATE,
          appData: this.dataSubject.value
         }
      }),
      startWith({
        dataState: DataState.LOADED_STATE,
        appData: this.dataSubject.value
      }),
      catchError((error: string) => {
        this.isLoading.next(false)
        console.log("Errr Accured : ", error);
        return of({
          dataState: DataState.ERROR_STATE,
          error
        });
      })
    )
  }


  
}
