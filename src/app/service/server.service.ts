import { HttpClient, HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { Component, Injectable } from '@angular/core';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { CustomResponse } from '../interface/custom-reponse';
import { Server } from '../interface/server';
import { Status } from '../enums/status.enum';

@Injectable({
  providedIn: 'root'
})
export class ServerService {
  private readonly apiUrl = "http://localhost:8081";
  constructor(private http: HttpClient) { }

  servers$ = <Observable<CustomResponse>>this.http.get<CustomResponse>(`${this.apiUrl}/server/list`)
     .pipe( 
        tap(console.log),
        catchError(this.handleError)
      );
  save$ = (server: Server) => 
   <Observable<CustomResponse>>this.http.post<CustomResponse>(`${this.apiUrl}/server/save`, server)
  .pipe( 
      tap(console.log),
      catchError(this.handleError)
  );

  ping$ = (ipAddress: string) => 
   <Observable<CustomResponse>>this.http.get<CustomResponse>(`${this.apiUrl}/server/ping/${ipAddress}`)
  .pipe( 
      tap(console.log),
      catchError(this.handleError)
  );

  filter$ = (status: Status, response: CustomResponse) => <Observable<CustomResponse>>
  new Observable<CustomResponse>(
    suscriber => {
      console.log(response);
      suscriber.next(
        status === Status.ALL ? { ...response, message: `Servers filtered by ${status} status` } :
          {
            ...response,
            message: response.data.servers
              .filter(server => server.status === status).length > 0 
                ? `Servers filtered by 
                ${status === Status.SERVER_UP ? 'SERVER UP'
                : 'SERVER DOWN'} status` 
                : `No servers of ${status} found`,
            data: {
              servers: response.data.servers
                .filter(server => server.status === status)
            }
          }
      );
      suscriber.complete();
    }
  )
    .pipe(
      tap(console.log),
      catchError(this.handleError)
    );

  delete$ = (server_id: number) => 
   <Observable<CustomResponse>>this.http.delete<CustomResponse>(`${this.apiUrl}/server/delete/${server_id}`)
  .pipe( 
      tap(console.log),
      catchError(this.handleError)
  );
  

  private handleError(error: HttpErrorResponse): Observable<never>  {
    console.log(error);
    
    return throwError(`An error accured - Error Code: ${error.status}`)

  }
                       


}
