import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { delay, map, Observable, of, switchMap } from 'rxjs';
import { Country } from '../models/country.model';
import { Question } from '../models/question.model';
import { CountryResponse } from '../models/country-response.model';

@Injectable({
  providedIn: 'root'
})
export class CountryService {

  headers = new HttpHeaders({'X-Api-Key': 'f8MOfLlvFAqOssdw31l3Ng==fUsgQMuSl4RQLBxj'});

  private countries: Country[] = [];
  
  constructor(private http: HttpClient) { }

  loadCountries(): Observable<Country[]> {
    if (this.countries.length > 0) {
      return of(this.countries);
    }

    return this.http.get<Country[]>('countries.json').pipe(
      map((data) => {
        this.countries = data;
        return data;
      })
    );
  }

  getRandomCountries(count: number = 3): Observable<Country[]> {
    return this.loadCountries().pipe(
      map((countries) => {
        const shuffled = [...countries].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
      })
    );
  }

  getFlag(code: string): Observable<CountryResponse> {
    // return this.http.get<CountryResponse>(`https://api.api-ninjas.com/v1/countryflag?country=${code}`, { headers: this.headers }).pipe(
    //   map((data) => {
    //     return data;
    //   })
    // );
    const resp: CountryResponse = {
      country: 'AR',
      square_image_url: 'https://api-ninjas-data.s3.us-west-2.amazonaws.com/flags/1x1/858qjgtN/ar.svg',
      rectangle_image_url: 'https://api-ninjas-data.s3.us-west-2.amazonaws.com/flags/1x1/858qjgtN/ar.svg'
    };

    return of(resp);
  }

getQuestion(): Observable<Question> {
  return this.getRandomCountries(3).pipe(
    map((countries) => {
      const correct = countries[Math.floor(Math.random() * countries.length)];
      return { countries, correct };
    }),

    switchMap(({ countries, correct }) =>
      this.getFlag(correct.code).pipe(
        map((countryResponse) => ({
          options: countries,
          correct,
          flagUrl: countryResponse.square_image_url,
        }))
      )
    )
  );
}
}
