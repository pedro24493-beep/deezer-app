import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DeezerService {
  private http = inject(HttpClient);

  searchTracks(query: string): Observable<any> {
    const cleanQuery = encodeURIComponent(query.trim());
    const url = `https://api.deezer.com/search?q=${cleanQuery}&output=jsonp`;
    return this.http.jsonp(url, 'callback');
  }
}