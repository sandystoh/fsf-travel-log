import { SafeStyle } from '@angular/platform-browser';

export interface LoginResponse {
    access_token: string;
    username: string;
    display_name: string;
}

export interface User {
    username: string;
    displayName: string;
    token: string;
}

export interface MapResponse {
    visitData: Object;
    places: Object[];
}

export interface Country {
    name: string;
    code: string;
}

export interface PlacesResponse {
    places: Place[];
    count: number;
}

export interface Place {
    id?: number;
    journey_id: number;
    journey_order: number;
    type: string; // BEEN, DREAM
    title: string; // limit 256
    owner: string // limit 128
    date?: string; //date
    lat?: number;
    lng?: number;
    country: string; // limit 2
    rating?: number;
    image_url?: string;
    description: string; // limit 65535
    private_notes?: string;
    last_updated?: string;
    active?: Boolean;

    url?: SafeStyle;
    journey_title?: string;
    country_name?: string;
}

export interface Journey {
    id?: number;
    title: string;
    owner: string;
    type: string;
    description?: string;
    date?: string;
    num_places: number;
    image_url?: string;
    last_updated?: string;
    active?: Boolean;
    month?: string;
    year?: string;
}