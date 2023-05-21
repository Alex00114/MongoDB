import { HttpClient } from '@angular/common/http';
import { AfterViewInit } from '@angular/core';
import { Component, ViewChild } from '@angular/core';
import { GoogleMap } from '@angular/google-maps'
import { Observable } from 'rxjs';
import {  GeoFeatureCollection } from './models/geojson.model';
import { Ci_vettore } from './models/ci_vett.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit {
  title = 'server mappe';
  //Variabile che conterrà i nostri oggetti GeoJson
  geoJsonObject!: GeoFeatureCollection;
  //Observable per richiedere al server python i dati sul DB
  obsGeoData!: Observable<GeoFeatureCollection>;
  // Centriamo la mappa
  center: google.maps.LatLngLiteral = { lat: 45.506738, lng: 9.190766 };
  zoom = 8;

  obsCiVett!: Observable<Ci_vettore[]>; //Crea un observable per ricevere i vettori energetici
  markerList!: google.maps.MarkerOptions[];

  circleCenter!: google.maps.LatLngLiteral;
  circleOptions!: any;

  constructor(public http: HttpClient) { 
    this.circleOptions =  {fillColor : 'red', clickable : true, editable : true}
  }
  
  ngAfterViewInit(): void {
    
  }

  //Metodo che scarica i dati nella variabile geoJsonObject
  prepareData = (data: GeoFeatureCollection) => {
    this.geoJsonObject = data
    console.log( this.geoJsonObject );
  }

 //Una volta che la pagina web è caricata, viene lanciato il metodo ngOnInit scarico i    dati 
  //dal server
  ngOnInit() {

  }

  prepareCiVettData = (data: Ci_vettore[]) => {
    console.log(data); //Verifica di ricevere i vettori energetici
    this.markerList = []; //NB: markers va dichiarata tra le proprietà markers : Marker[]
    for (const iterator of data) { //Per ogni oggetto del vettore creo un Marker
      let m : google.maps.MarkerOptions = 
      {
       position : new google.maps.LatLng (iterator.WGS84_X, iterator.WGS84_Y),
       icon : this.findImage(iterator.CI_VETTORE)
      }
      //Marker(iterator.WGS84_X,iterator.WGS84_Y,iterator.CI_VETTORE);
      this.markerList.push(m);
    }
  }

  //Questo metodo richiama la route sul server che recupera il foglio specificato nella casella di testo
  cambiaFoglio(foglio : any)
  {
    let val = foglio.value; //Commenta qui
    this.obsCiVett = this.http.get<Ci_vettore[]>(`https://5000-alex00114-mongodb-lv0f6f714tr.ws-eu97.gitpod.io/ci_vettore/${val}`);  //prende il valore inserito dall'utente e lo aggiunge alla fine dell'url
    this.obsCiVett.subscribe(this.prepareCiVettData); //Commenta qui
    console.log(val);
    return false;
  }

  findImage(label: string) : google.maps.Icon {
    if (label.includes("Gas")) {
      return { url: './assets/img/gas-16.ico', scaledSize: new google.maps.Size(32,32) };
    }
    if (label.includes("elettrica")) {
      return { url: './assets/img/electricity-16.ico', scaledSize: new google.maps.Size(32,32) };
    }
    //Se non viene riconosciuta nessuna etichetta ritorna l'icona undefined
      return {url: '.assets/img/map-marker-2-16.ico', scaledSize: new google.maps.Size(32,32)}
  }

  //Aggiungi il gestore del metodo mapClicked
  mapClicked($event: google.maps.MapMouseEvent) {
    console.log($event);
    let coords= $event.latLng; //Queste sono le coordinate cliccate
    if (coords != null) {
      this.center = { lat: coords.lat(), lng: coords.lng() };
      this.circleCenter = { lat: coords.lat(), lng: coords.lng() };
    }
    
  }
}
