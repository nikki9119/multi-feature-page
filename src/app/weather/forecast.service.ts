import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, switchMap, pluck, mergeMap, filter, toArray, share } from 'rxjs/operators';
import { HttpClient, HttpParams } from '@angular/common/http';

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
  constructor(private http: HttpClient) { }

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
        share()
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
    });
  }
}
