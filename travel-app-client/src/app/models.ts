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
    journey_order?: number;
    type: string; // BEEN, DREAM
    title: string; // limit 128
    location_name: string; // limit 256
    owner: string; // limit 128
    date?: string; // date
    lat?: number;
    lng?: number;
    country: string; // limit 2
    rating?: number;
    image_url?: string;
    description: string; // limit 65535
    private_notes?: string;
    last_updated?: string;
    active?: number;

    alpha?: string;
    url?: SafeStyle;
    journey_title?: string;
    journey_count?: number;
    country_name?: string;
    next_id?: number;
    prev_id?: number;
    changed?: boolean;
}

export interface JourneysResponse {
    count: number;
    journeys: Journey[];
}

export interface JourneyResponse {
    places: Place[];
    journey: Journey;
}

export interface Journey {
    id?: number;
    title: string;
    owner: string;
    type: string;
    description?: string;
    date?: string;
    end_date?: string; // date
    num_places?: number;
    image_url?: string;
    last_updated?: string;
    active?: boolean;
    month?: string;
    year?: string;

    old_type?: string;
    place_ids?: string;
    url?: SafeStyle;
    duration?: number;
}