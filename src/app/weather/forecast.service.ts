import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { map, switchMap, pluck, mergeMap, filter, toArray, share, tap, catchError, retry } from 'rxjs/operators';
import { HttpClient, HttpParams } from '@angular/common/http';
import { NotificationsService } from '../notifications/notifications.service';

interface WeatherResponse {
  list: {
    dt_txt: string;
    main: {
      temp: number;
    }
  }[]
}

@Injectable({
  providedIn: 'root'
})
export class ForecastService {

  private url = 'https://api.openweathermap.org/data/2.5/forecast';
  constructor(
    private http: HttpClient, 
    private notificationsService: NotificationsService
  ) { }

  getForecast(){
    return this.getCurrentLocation()
      .pipe(
        map(coords => {
          return new HttpParams()
            .set('lat',String(coords.latitude))
            .set('lon',String(coords.longitude))
            .set('units','metric')
            .set('appid','e1d890925e4b1905682f93c40d65e24a')
        }),
        switchMap(params => this.http.get<WeatherResponse>(this.url,{ params })),
        pluck('list'),
        mergeMap(value => of(...value)),
        filter((value, index) => index % 8 === 0),
        map(value => {
          return {
            dateString: value.dt_txt,
            temp: value.main.temp
          };
        }),
        toArray(),
        share(),
        // tap(() => {
        //   this.notificationsService.addSuccess('Weather fetch successful');
        // }),
        // catchError((err) => {
        //   this.notificationsService.addError('Weather fetch failed');
        //   return throwError(err);
        // })
      );
  }

  getCurrentLocation(){
    return new Observable<Coordinates>((observer)=>{
      window.navigator.geolocation.getCurrentPosition(
        (position) => {
          observer.next(position.coords);
          observer.complete();
        },
        (err) => observer.error(err)
      );
    }).pipe(
      retry(2),
      tap(() => {
        this.notificationsService.addSuccess('Location fetch successful');
      }),
      catchError((err) => {
        this.notificationsService.addError('Location fetch failed');
        return throwError(err);
      })
    );
  }
}
