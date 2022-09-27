/*
SQLyog Ultimate v12.09 (64 bit)
MySQL - 10.4.24-MariaDB : Database - db_wa
*********************************************************************
*/

/*!40101 SET NAMES utf8 */;

/*!40101 SET SQL_MODE=''*/;

/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
CREATE DATABASE /*!32312 IF NOT EXISTS*/`db_wa` /*!40100 DEFAULT CHARACTER SET utf8mb4 */;

USE `db_wa`;

/*Table structure for table `devices` */

DROP TABLE IF EXISTS `devices`;

CREATE TABLE `devices` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `device_id` int(11) DEFAULT NULL,
  `state` varchar(50) DEFAULT NULL,
  `qrcode` varchar(512) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `logout` tinyint(3) unsigned NOT NULL DEFAULT 0,
  `nomorwa` varchar(25) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique` (`device_id`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4;

/*Table structure for table `inbox` */

DROP TABLE IF EXISTS `inbox`;

CREATE TABLE `inbox` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `msg_id` varchar(255) NOT NULL,
  `msg_from` varchar(512) DEFAULT NULL,
  `msg_to` varchar(512) DEFAULT NULL,
  `msg_value` text DEFAULT NULL,
  `msg_time` datetime DEFAULT NULL,
  `msg_media` longtext DEFAULT NULL,
  `msg_mime` varchar(255) DEFAULT NULL,
  `msg_filename` varchar(255) DEFAULT NULL,
  `ack` int(11) DEFAULT 0,
  `created_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4;

/*Table structure for table `outbox` */

DROP TABLE IF EXISTS `outbox`;

CREATE TABLE `outbox` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `msg_id` varchar(255) DEFAULT NULL,
  `msg_from` varchar(255) DEFAULT NULL,
  `msg_to` varchar(255) DEFAULT NULL,
  `msg_value` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `msg_time` datetime DEFAULT NULL,
  `msg_media` longtext DEFAULT NULL,
  `msg_mime` varchar(255) DEFAULT NULL,
  `msg_filename` varchar(255) DEFAULT NULL,
  `ack` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4;

/*Table structure for table `sentitems` */

DROP TABLE IF EXISTS `sentitems`;

CREATE TABLE `sentitems` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `msg_id` varchar(255) DEFAULT NULL,
  `msg_from` varchar(255) DEFAULT NULL,
  `msg_to` varchar(255) DEFAULT NULL,
  `msg_value` text DEFAULT NULL,
  `msg_time` datetime DEFAULT NULL,
  `msg_mime` varchar(255) DEFAULT NULL,
  `msg_filename` varchar(255) DEFAULT NULL,
  `msg_media` longtext DEFAULT NULL,
  `ack` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
