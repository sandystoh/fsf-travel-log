drop database if exists travel;
create database travel;
use travel;

create table users (
	username varchar(20) not null,
    password varchar(128) not null,
    email varchar(128),
    display_name varchar(128),    
    primary key(username)
);

-- drop table journeys;
create table journeys (
	id int auto_increment not null,
    title varchar(256) not null,
    owner varchar(128) not null,
    type ENUM ('BEEN','DREAM') not null,
    description text,
    date datetime,
    num_places int default 0 not null,
    last_updated datetime default current_timestamp,
	primary key(id),
    key(owner),
    key(title),
    constraint fk_journeys_user
    	foreign key(owner)
        references users(username)
);

create table journeys_countries (
	journey_id int not null,
    country_code char(2) not null,
    primary key(journey_id, country_code),
    constraint fk_journeys
    	foreign key(journey_id)
        references journeys(id)
);

-- drop table places;
create table places (
	id int auto_increment not null,
    journey_id int,
    journey_order int,
    type ENUM ('BEEN','DREAM') not null,
    title varchar(256) not null,
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

insert into users (username, password, email, display_name) 
values ('sandystoh', sha2('sandystoh', 256), 'sandystoh@gmail.com', 'Sandy');
insert into users (username, password, email, display_name) 
values ('fred', sha2('fred', 256), 'fred@gmail.com', 'Fred');

insert into journeys values
('1', 'United States', 'sandystoh', 'BEEN', 'USA Trip 2016', '2016-07-01 00:00:00', '1', '2019-12-05 00:00:00');

insert into places values
('1', '1', '1', 'BEEN', 'Arches National Park', 'sandystoh', '2016-07-01 00:00:00', '38.73310000', '-109.59250000', 'US', '8', 'sandystoh/09692d0b0f05e8b3016fd79683acf5ff', 'Lovely Place!', 'Got Lost in the Desert!', '2019-12-05 13:39:16'),
('2', '1', '2', 'BEEN', 'Bryce Canyon National Park', 'sandystoh', '2016-07-02 00:00:00', '37.59300000', '-112.18710000', 'US', '7', 'sandystoh/17d2a54258058e8da6e4d7cc177c13f6', 'Lovely Place!', 'Got Lost in the Desert!', '2019-12-05 14:51:18')
