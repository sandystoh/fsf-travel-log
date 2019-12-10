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
	primary key(id),
    key(owner),
    key(title),
    constraint fk_journeys_user
    	foreign key(owner)
        references users(username)
);

/*
create table journeys_countries (
	journey_id int not null,
    country_code char(2) not null,
    primary key(journey_id, country_code),
    constraint fk_journeys
    	foreign key(journey_id)
        references journeys(id)
); */

-- drop table places;
create table places (
	id int auto_increment not null,
    journey_id int,
    journey_order int,
    type ENUM ('BEEN','DREAM') not null,
    title varchar(128) not null,
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

insert into users (username, password, email, display_name) 
values ('sandystoh', sha2('sandystoh', 256), 'sandystoh@gmail.com', 'Sandy');
insert into users (username, password, email, display_name) 
values ('fred', sha2('fred', 256), 'fred@gmail.com', 'Fred');

insert into journeys values
('1', 'United States', 'sandystoh', 'BEEN', 'USA Trip 2016', '2016-05-01 00:00:00', '2016-05-10 00:00:00',  '2', 'sandystoh/9c86c1a2c9d09e77f583898e8561e9b0', '2019-12-05 00:00:00', 1),
('2', 'New Zealand', 'sandystoh', 'BEEN', 'NZ Trip 2017', '2017-01-01 00:00:00', '2017-01-20 00:00:00', '2', 'sandystoh/fc81be58c0684ea0fdb5804930ef509f', '2019-12-05 00:00:00', 1);

insert into places values
('1', '1', '1', 'BEEN', 'Arches National Park', 'sandystoh', '2016-07-05', '38.73310000', '-109.59250000', 'US', '5', 'sandystoh/2154e0b20643ea7bd6a831acf017f18f', 'Lovely Place!', 'Got Lost in the Desert!', '2019-11-05', 1),
('2', '1', '2', 'BEEN', 'Bryce Canyon National Park', 'sandystoh', '2016-07-06', '37.59300000', '-112.18710000', 'US', '4', 'sandystoh/9c86c1a2c9d09e77f583898e8561e9b0', 'Lovely Place 2!', 'Got Lost in the Desert!', '2019-11-05', 1),
('3', '2', '1', 'BEEN', 'Auckland', 'sandystoh', '2017-01-06', '-36.8485', '174.7633', 'NZ', '3', 'sandystoh/fc81be58c0684ea0fdb5804930ef509f', 'Lovely Place 3!', 'Got Lost in the City!', '2019-11-05', 1),
('4', '2', '2', 'BEEN', 'Mata Mata', 'sandystoh', '2017-01-06', '-37.8109', '175.7765', 'NZ', '2', 'sandystoh/4d1e3f5745ae8cb4d83040dd85fc6fd31', 'Lovely Place 4!', 'Got Lost in the Hobbit Holes!', '2019-11-05', 1)


-- Mongo
-- db.getCollection('countries').createIndex({code2l: 1})
-- db.getCollection('countries').createIndex({name: 1})