drop database if exists travel;
create database travel;
use travel;

create table users (
	username varchar(20) not null,
    password varchar(128) not null,
    email varchar(128),
    display_name varchar(128),
    google_id varchar(128),
    google_token varchar(256),
    primary key(username)
);

create table journeys (
	id int auto_increment not null,
    title varchar(128) not null,
    owner varchar(128) not null,
    type ENUM ('BEEN','DREAM') not null,
    description text,
    date datetime,
    end_date datetime,
    num_places int default 0 not null,
    image_url varchar(128),
    last_updated datetime default current_timestamp,
    active TINYINT(1) default 1,
    refresh_map TINYINT(1) default 1,
	primary key(id),
    key(owner),
    key(title),
    constraint fk_journeys_user
    	foreign key(owner)
        references users(username)
);

create table places (
	id int auto_increment not null,
    journey_id int,
    journey_order int,
    type ENUM ('BEEN','DREAM') not null,
    title varchar(128) not null,
    location_name varchar(128) not null,
    owner varchar(128) not null,
	date datetime,
    lat DECIMAL(10, 8),
    lng DECIMAL(11, 8),
    country char(2),
    rating int,
    image_url varchar(128),
    description text,
    private_notes text,
    last_updated datetime default current_timestamp,
    active TINYINT(1) default 1,
    primary key(id),
    key(owner),
    key(title),
    constraint fk_places_user
    	foreign key(owner)
        references users(username)
);

create table notes (
	id int auto_increment not null,
	place_id int not null,
    comments text not null,
    image_url varchar(128),
    url varchar(128),
    primary key(id)
);

-- Mongo
-- import countries_formatted.json
-- db.getCollection('countries').createIndex({code: 1})
-- db.getCollection('countries').createIndex({name: 1})