import { Component, inject, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DeezerService } from './deezer';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

declare var Swal: any;

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html'
})
export class App implements OnInit {
  query: string = '';
  loading: boolean = false;
  jsonResponse: any = null;
  showJson: boolean = false;
  
  activeTab: 'home' | 'search' = 'home';
  homeTracks: any[] = [];

  // Accesos rápidos con imágenes reales de los artistas y categorías
  quickPicks = [
    { 
      name: 'Bad Bunny', 
      query: 'Bad Bunny', 
      image: 'https://e-cdns-images.dzcdn.net/images/artist/25a8f39fbc44ea07120735158e23f054/500x500-000000-80-0-0.jpg' 
    },
    { 
      name: 'Karol G', 
      query: 'Karol G', 
      image: 'https://e-cdns-images.dzcdn.net/images/artist/93297a701974720e5ff30591c49dbfa3/500x500-000000-80-0-0.jpg' 
    },
    { 
      name: 'Dua Lipa', 
      query: 'Dua Lipa', 
      image: 'https://e-cdns-images.dzcdn.net/images/artist/81fb39226871031a00a12dd2b251a7e2/500x500-000000-80-0-0.jpg' 
    },
    { 
      name: 'Éxitos 2026', 
      query: 'Top Hits', 
      image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80' 
    },
    { 
      name: 'Queen', 
      query: 'Queen', 
      image: 'https://e-cdns-images.dzcdn.net/images/artist/06071ef2875f2d6501235122f643e262/500x500-000000-80-0-0.jpg' 
    },
    { 
      name: 'Reggaetón', 
      query: 'Reggaeton Hits', 
      image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&q=80' 
    }
  ];

  private deezerService = inject(DeezerService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit() {
    this.loadHomeData();
  }

  loadHomeData() {
    this.loading = true;
    const featuredArtists = ['Bad Bunny', 'Dua Lipa', 'Karol G', 'The Weeknd', 'Queen', 'Billie Eilish', 'Feid', 'Coldplay'];
    
    const requests = featuredArtists.map(artist => 
      this.deezerService.searchTracks(artist).pipe(
        catchError(() => of({ data: [] }))
      )
    );

    forkJoin(requests).subscribe({
      next: (results: any[]) => {
        this.loading = false;
        let mixedTracks: any[] = [];
        
        results.forEach((res) => {
          if (res && res.data && res.data.length > 0) {
            mixedTracks.push(res.data[0]);
            if (res.data[1]) mixedTracks.push(res.data[1]);
          }
        });

        this.homeTracks = mixedTracks.sort(() => Math.random() - 0.5);
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  goHome() {
    this.activeTab = 'home';
    this.query = '';
  }

  quickSearch(term: string) {
    this.query = term;
    this.search();
  }

  search() {
    if (!this.query.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Campo vacío',
        text: 'Por favor, escribe el nombre de un artista o canción.'
      });
      return;
    }

    this.loading = true;
    this.activeTab = 'search';
    this.cdr.detectChanges();

    this.deezerService.searchTracks(this.query).subscribe({
      next: (data) => {
        this.loading = false;
        this.jsonResponse = data;
        this.cdr.detectChanges();

        if (!data || !data.data || data.data.length === 0) {
          Swal.fire({
            icon: 'info',
            title: 'Sin resultados',
            text: 'No se encontraron canciones para tu búsqueda.'
          });
        }
      },
      error: (err) => {
        this.loading = false;
        this.cdr.detectChanges();
        console.error('Error al consultar Deezer:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error de conexión',
          text: 'Ocurrió un fallo al consultar la API de Deezer.'
        });
      }
    });
  }
}