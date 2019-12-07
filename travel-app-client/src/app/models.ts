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