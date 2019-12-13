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
    refresh_map TINYINT(1) default 1,
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

insert into users (username, password, email, display_name) 
values ('sandystoh', sha2('sandystoh', 256), 'sandystoh@gmail.com', 'Sandy');
insert into users (username, password, email, display_name) 
values ('fred', sha2('fred', 256), 'fred@gmail.com', 'Fred');
insert into users (username, password, email, display_name) 
values ('fbsandy', sha2('fbsandy', 256), 'fbsandy@gmail.com', 'fbsandy');

insert into journeys values
('1', 'United States 2015', 'sandystoh', 'BEEN', 'Driving Trip around the beautiful National Parks of Utah and Arizona.', '2015-07-05 00:00:00', '2015-07-20 00:00:00', '7', 'sandystoh/7ca31c1e21114baaf180baff0cf6d631', '2019-12-12 01:33:03', '1', '0'),
('2', 'New Zealand 2013', 'sandystoh', 'BEEN', 'There and Back Again!', '2013-11-10 00:00:00', '2013-11-25 00:00:00', '3', 'sandystoh/35cb10eef644fb59692c22eb3d8e04ed', '2019-12-12 01:44:54', '1', '1'),
('3', 'Spain and Portugal 2017', 'sandystoh', 'BEEN', 'Spanish Serenade', '2017-04-24 00:00:00', '2017-05-05 00:00:00', '2', 'sandystoh/f87a628d8db6bf13150c1405e667d674', '2019-12-13 21:55:27', '1', '0');

insert into places values
('1', '1', '1', 'BEEN', 'Bryce Canyon National Park', 'Bryce Canyon National Park', 'sandystoh', '2015-07-08 00:00:00', '37.59303770', '-112.18708950', 'US', '4', 'sandystoh/be953e83fe41e495f1d9a2b24f76df8a', 'Amazingly alien landscapes', '', '2019-12-12 01:35:20', '1'),
('2', '2', '1', 'BEEN', 'Cape Reinga', 'Cape Reinga', 'sandystoh', '2013-11-12 00:00:00', '-34.42877860', '172.68048700', 'NZ', '3', 'sandystoh/025dfe83de071549a9b29fa10e8c4904', 'The end of the world!', '', '2019-12-12 01:45:55', '1'),
('3', '1', '2', 'BEEN', 'Horseshoe Bend', 'Horseshoe Bend', 'sandystoh', '2015-07-05 00:00:00', '36.87915980', '-111.51042350', 'US', '5', 'sandystoh/71fbbae2b7accaf17999db9a2f04d941', 'Nearly went over the cliff trying to take photos!', '', '2019-12-12 02:03:26', '1'),
('4', '1', '3', 'BEEN', 'Antelope Canyon', 'Antelope Canyon', 'sandystoh', '2015-07-08 00:00:00', '36.86191030', '-111.37433020', 'US', '5', 'sandystoh/85b3eefa81c1b1700169fdf7456d0b20', 'Magical', '', '2019-12-12 02:05:57', '1'),
('5', '1', '4', 'BEEN', 'Monument Valley', 'Oljato-Monument Valley', 'sandystoh', '2015-07-09 00:00:00', '37.00424540', '-110.17347850', 'US', '4', 'sandystoh/0ad22897286cee413086b4886695e488', 'Into the West', '', '2019-12-12 10:07:40', '1'),
('6', '1', '5', 'BEEN', 'Arches National Park', 'Arches National Park', 'sandystoh', '2015-07-11 00:00:00', '38.73308100', '-109.59251390', 'US', '5', 'sandystoh/bb6c98acdce52db965de01ad44d59fed', 'Amazing!', '', '2019-12-12 02:12:46', '1'),
('7', '1', '6', 'BEEN', 'Canyonlands National Park', 'Canyonlands National Park', 'sandystoh', '2015-07-11 00:00:00', '38.32686930', '-109.87825920', 'US', '3', 'sandystoh/5b2384150f6cebc2582c0a6e7c277a63', 'Wow', '', '2019-12-12 02:14:38', '1'),
('8', '1', '7', 'BEEN', 'Zion National Park', 'Zion National Park', 'sandystoh', '2015-07-07 00:00:00', '37.29820220', '-113.02630050', 'US', '5', 'sandystoh/64ff57758eea5d3e0464648d2cdc9397', 'Out of this world.', '', '2019-12-12 02:17:41', '1'),
('9', '2', '2', 'BEEN', 'Hobbiton', 'Hobbiton', 'sandystoh', '2013-11-13 00:00:00', '-37.81088030', '175.77646070', 'NZ', '4', 'sandystoh/ccb97e4e87cd0ff8df46de5e6eef0af9', 'Drank ale at the green dragon!', '', '2019-12-12 13:55:03', '1'),
('10', '2', '2', 'BEEN', 'Bay of Islands', 'Bay of Islands', 'sandystoh', '2013-11-12 00:00:00', '-35.18437010', '174.16461630', 'NZ', '4', 'sandystoh/39dab235df9d167a1dbc346021eff92f', 'Swimming with the Dolphins!', '', '2019-12-13 21:31:10', '1'),
('11', '3', '1', 'BEEN', 'La Sagrada Familia', 'La Sagrada Familia', 'sandystoh', '2017-04-24 00:00:00', '41.40362990', '2.17435580', 'ES', '5', 'sandystoh/21f05229aa80a30b7c26d36d2475c350', 'Awe Inspiring and humbling', '', '2019-12-13 21:55:15', '1'),
('12', '3', '2', 'BEEN', 'Zaragoza', 'Zaragoza', 'sandystoh', '2017-04-25 00:00:00', '41.64882260', '-0.88908530', 'ES', '4', 'sandystoh/1264073520670c12368879daa1cfd5ea', 'Modern traveling adventure wanderlust excursion blogger travelblogger design, darn pretty traveling design design pretty. Excursion cute design modern simple expedition modern, wanderlust cute traveling cute. Darn traveling traveler Travel expedition traveling, expedition colorful fun WordPress traveling design.\n', '', '2019-12-13 13:56:45', '1');


-- Mongo
-- db.getCollection('countries').createIndex({code2l: 1})
-- db.getCollection('countries').createIndex({name: 1})