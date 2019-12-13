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

/*
insert into journeys values
('1', 'United States', 'sandystoh', 'BEEN', 'USA Trip 2016', '2016-05-01 00:00:00', '2016-05-10 00:00:00',  '6', 'sandystoh/55ec9e0cafc45c59c5038175baf62c6e', '2019-12-05 00:00:00', 1, 0),
('2', 'New Zealand', 'sandystoh', 'BEEN', 'NZ Trip 2017', '2017-01-01 00:00:00', '2017-01-20 00:00:00', '6', 'sandystoh/69b5f7b1e503bf5d25abe629554aee3f', '2019-12-05 00:00:00', 1, 0),
('3', 'Scandinavia 2019', 'sandystoh', 'BEEN', '', '2019-12-01 00:00:00', '2019-12-10 00:00:00', '0', 'sandystoh/b2bf582e5051ddd1da4fd7976be2dd52', '2019-12-11 08:29:47', '1', '1');

insert into places values
('1', '1', '6', 'BEEN', 'Arches National Park', 'Arches National Park', 'sandystoh', '2016-07-05 00:00:00', '38.73310000', '-109.59250000', 'US', '5', 'sandystoh/9c86c1a2c9d09e77f583898e8561e9b0', 'Lovely Place!', 'Got Lost in the Desert!', '2019-11-05 00:00:00', '1'),
('2', '1', '1', 'BEEN', 'Bryce Canyon National Park', 'Bryce Canyon National Park','sandystoh', '2016-07-06 00:00:00', '37.59300000', '-112.18710000', 'US', '4', 'sandystoh/9c86c1a2c9d09e77f583898e8561e9b0', 'Lovely Place 2!', 'Got Lost in the Desert!', '2019-11-05 00:00:00', '1'),
('3', '2', '1', 'BEEN', 'Auckland', 'Auckland', 'sandystoh', '2017-01-06 00:00:00', '-36.84850000', '174.76330000', 'NZ', '1', 'sandystoh/fc81be58c0684ea0fdb5804930ef509f', 'Lovely Place 3!', 'Got Lost in the City!', '2019-11-05 00:00:00', '1'),
('4', '2', '2', 'BEEN', 'Hobitton', 'Mata Mata', 'sandystoh', '2016-07-02 00:00:00', '-37.81090000', '175.77650000', 'NZ', '2', 'sandystoh/4d1e3f5745ae8cb4d83040dd85fc6fd3', 'Lovely Place 4!', 'Got Lost in the Hobbit Holes!', '2019-11-05 00:00:00', '1'),
('5', '2', '3', 'BEEN', 'Rotorua', 'Rotorua', 'sandystoh', '2017-01-06 00:00:00', '-38.13680000', '176.24970000', 'NZ', '3', NULL, 'Lovely Place 4!', 'Got Lost in the Hobbit Holes!', '2019-11-05 00:00:00', '1'),
('6', '1', '2', 'BEEN', 'Antelope Canyon', 'Antelope Canyon', 'sandystoh', '2016-07-02 00:00:00', '36.86190000', '-111.37430000', 'US', '5', NULL, 'Lovely Place!', 'Got Lost in the Desert!', '2019-12-09 14:08:42', '1'),
('7', '0', '0', 'BEEN', 'Great Wall', 'Great Wall', 'sandystoh', '2016-07-02 00:00:00', '37.93419810', '22.98436750', 'CN', '3', NULL, 'aa', 'bb', '2019-12-09 14:31:07', '1'),
('8', '1', '4', 'BEEN', 'Canyonlands National Park', 'Canyonlands National Park','sandystoh', '2016-07-05 00:00:00', '38.32690000', '-109.87830000', 'US', '5', NULL, 'Lovely Place!', 'Got Lost in the Desert!', '2019-11-05 00:00:00', '1'),
('9', '1', '5', 'BEEN', 'Moab', 'Moab','sandystoh', '2016-07-06 00:00:00', '38.57330000', '-109.54980000', 'US', '4', '', 'Lovely Place 2!', 'Got Lost in the Desert!', '2019-11-05 00:00:00', '1'),
('10', '2', '4', 'BEEN', 'Wellington', 'Wellington', 'sandystoh', '2017-01-06 00:00:00', '-41.2865', '174.77620000', 'NZ', '1', '', 'Lovely Place 3!', 'Got Lost in the City!', '2019-11-05 00:00:00', '1'),
('11', '2', '5', 'BEEN', 'Christchurch', 'Christchurch', 'sandystoh', '2016-07-02 00:00:00', '-43.53210000', '172.63620000', 'NZ', '2', '', 'Lovely Place 4!', 'Got Lost in the Hobbit Holes!', '2019-11-05 00:00:00', '1'),
('12', '2', '6', 'BEEN', 'Queenstown', 'Queenstown', 'sandystoh', '2017-01-06 00:00:00', '-45.03120000', '168.6626000', 'NZ', '3', 'sandystoh/4d1e3f5745ae8cb4d83040dd85fc6fd3', 'Lovely Place 4!', 'Got Lost in the Hobbit Holes!', '2019-11-05 00:00:00', '1'),
('13', '1', '3', 'BEEN', 'Monument Valley', 'Monument Valley', 'sandystoh', '2016-07-02 00:00:00', '36.99800000', '-110.09850000', 'US', '5', '', 'Lovely Place!', 'Got Lost in the Desert!', '2019-12-09 14:08:42', '1'),
('14', '0', '0', 'BEEN', 'Corinth Canal',  'Corinth Canal', 'sandystoh', '2016-07-02 00:00:00', '37.93419810', '22.98436750', 'GR', '3', 'sandystoh/2154e0b20643ea7bd6a831acf017f18f', 'aa', 'bb', '2019-12-09 14:31:07', '1')
*/
insert into journeys values
('1', 'United States 2015', 'sandystoh', 'BEEN', 'Driving Trip around the beautiful National Parks of Utah and Arizona.', '2015-07-05 00:00:00', '2015-07-20 00:00:00', '7', 'sandystoh/7ca31c1e21114baaf180baff0cf6d631', '2019-12-12 01:33:03', '1', '0'),
('2', 'New Zealand 2013', 'sandystoh', 'BEEN', 'There and Back Again!', '2013-11-10 00:00:00', '2013-11-25 00:00:00', '1', 'sandystoh/35cb10eef644fb59692c22eb3d8e04ed', '2019-12-12 01:44:54', '1', '1');
insert into places values
('1', '1', '1', 'BEEN', 'Bryce Canyon National Park', 'Bryce Canyon National Park', 'sandystoh', '2015-07-08 00:00:00', '37.59303770', '-112.18708950', 'US', '4', 'sandystoh/be953e83fe41e495f1d9a2b24f76df8a', 'Amazingly alien landscapes', '', '2019-12-12 01:35:20', '1'),
('2', '2', '1', 'BEEN', 'Cape Reinga', 'Cape Reinga', 'sandystoh', '2013-11-12 00:00:00', '-34.42877860', '172.68048700', 'NZ', '3', 'sandystoh/025dfe83de071549a9b29fa10e8c4904', 'The end of the world!', '', '2019-12-12 01:45:55', '1'),
('3', '1', '2', 'BEEN', 'Horseshoe Bend', 'Horseshoe Bend', 'sandystoh', '2015-07-05 00:00:00', '36.87915980', '-111.51042350', 'US', '5', 'sandystoh/71fbbae2b7accaf17999db9a2f04d941', 'Nearly went over the cliff trying to take photos!', '', '2019-12-12 02:03:26', '1'),
('4', '1', '3', 'BEEN', 'Antelope Canyon', 'Antelope Canyon', 'sandystoh', '2015-07-08 00:00:00', '36.86191030', '-111.37433020', 'US', '5', 'sandystoh/85b3eefa81c1b1700169fdf7456d0b20', 'Magical', '', '2019-12-12 02:05:57', '1'),
('5', '1', '4', 'BEEN', 'Monument Valley', 'Oljato-Monument Valley', 'sandystoh', '2015-07-09 00:00:00', '37.00424540', '-110.17347850', 'US', '4', 'sandystoh/0ad22897286cee413086b4886695e488', 'Into the West', '', '2019-12-12 10:07:40', '1'),
('6', '1', '5', 'BEEN', 'Arches National Park', 'Arches National Park', 'sandystoh', '2015-07-11 00:00:00', '38.73308100', '-109.59251390', 'US', '5', 'sandystoh/bb6c98acdce52db965de01ad44d59fed', 'Amazing!', '', '2019-12-12 02:12:46', '1'),
('7', '1', '6', 'BEEN', 'Canyonlands National Park', 'Canyonlands National Park', 'sandystoh', '2015-07-11 00:00:00', '38.32686930', '-109.87825920', 'US', '3', 'sandystoh/5b2384150f6cebc2582c0a6e7c277a63', 'Wow', '', '2019-12-12 02:14:38', '1'),
('8', '1', '7', 'BEEN', 'Zion National Park', 'Zion National Park', 'sandystoh', '2015-07-07 00:00:00', '37.29820220', '-113.02630050', 'US', '5', 'sandystoh/64ff57758eea5d3e0464648d2cdc9397', 'Out of this world.', '', '2019-12-12 02:17:41', '1'),
('9', '2', '2', 'BEEN', 'Hobbiton', 'Hobbiton', 'sandystoh', '2013-11-13 00:00:00', '-37.81088030', '175.77646070', 'NZ', '4', 'sandystoh/ccb97e4e87cd0ff8df46de5e6eef0af9', 'Drank ale at the green dragon!', '', '2019-12-12 13:55:03', '1');


-- Mongo
-- db.getCollection('countries').createIndex({code2l: 1})
-- db.getCollection('countries').createIndex({name: 1})