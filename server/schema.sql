-- MariaDB dump 10.19  Distrib 10.4.28-MariaDB, for osx10.10 (x86_64)
--
-- Host: localhost    Database: innerbloom
-- ------------------------------------------------------
-- Server version	10.4.28-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `admin`
--

DROP TABLE IF EXISTS `admin`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `admin` (
  `admin_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(191) DEFAULT NULL,
  PRIMARY KEY (`admin_id`),
  CONSTRAINT `admin_ibfk_1` FOREIGN KEY (`admin_id`) REFERENCES `authentication` (`auth_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin`
--

LOCK TABLES `admin` WRITE;
/*!40000 ALTER TABLE `admin` DISABLE KEYS */;
INSERT INTO `admin` VALUES (1,'Admin User','admin@innerbloom.com');
/*!40000 ALTER TABLE `admin` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `anxiety`
--

DROP TABLE IF EXISTS `anxiety`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `anxiety` (
  `anxiety_id` int(11) NOT NULL AUTO_INCREMENT,
  `patient_id` int(11) NOT NULL,
  `conversation` text DEFAULT NULL,
  `s_module_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`anxiety_id`),
  KEY `patient_id` (`patient_id`),
  KEY `s_module_id` (`s_module_id`),
  CONSTRAINT `anxiety_ibfk_1` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`patient_id`) ON DELETE CASCADE,
  CONSTRAINT `anxiety_ibfk_2` FOREIGN KEY (`s_module_id`) REFERENCES `specialized_module` (`s_module_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `anxiety`
--

LOCK TABLES `anxiety` WRITE;
/*!40000 ALTER TABLE `anxiety` DISABLE KEYS */;
/*!40000 ALTER TABLE `anxiety` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `authentication`
--

DROP TABLE IF EXISTS `authentication`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `authentication` (
  `auth_id` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(191) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('patient','admin') DEFAULT 'patient',
  `reset_token` varchar(255) DEFAULT NULL,
  `reset_expiry` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`auth_id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `authentication`
--

LOCK TABLES `authentication` WRITE;
/*!40000 ALTER TABLE `authentication` DISABLE KEYS */;
INSERT INTO `authentication` VALUES (1,'admin@innerbloom.com','$2b$10$evvSFpuMnoVE0ANN6B9tvem.QEY3bMFTbg.yYTdNTmyZITQBMZdOa','admin',NULL,NULL,'2026-03-20 05:52:57'),(2,'user@innerbloom.com','$2b$10$4dkxKYQZ9RLxhrh5xeguIOYRPjHCqY9ZASCJhwUp8gXvQILDMvn8G','patient',NULL,NULL,'2026-03-20 05:52:57'),(3,'shakeel.skylinxtech@gmail.com','$2b$10$8D/zu6mQ0Nhu7rUGR6fsmeiKmDnofAne/IyVCcCmxiZzhMi.LyzGq','patient',NULL,NULL,'2026-03-27 12:10:20'),(4,'shakeel.skylinxtech+1@gmail.com','$2b$10$/8CaZoD7ziOZgTXW2aAzAunBhfeB2r3EXeHIaYJJssr4DjJR4ZVfK','patient',NULL,NULL,'2026-03-30 17:07:17');
/*!40000 ALTER TABLE `authentication` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bipolar`
--

DROP TABLE IF EXISTS `bipolar`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `bipolar` (
  `bipolar_id` int(11) NOT NULL AUTO_INCREMENT,
  `patient_id` int(11) NOT NULL,
  `conversation` text DEFAULT NULL,
  `s_module_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`bipolar_id`),
  KEY `patient_id` (`patient_id`),
  KEY `s_module_id` (`s_module_id`),
  CONSTRAINT `bipolar_ibfk_1` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`patient_id`) ON DELETE CASCADE,
  CONSTRAINT `bipolar_ibfk_2` FOREIGN KEY (`s_module_id`) REFERENCES `specialized_module` (`s_module_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bipolar`
--

LOCK TABLES `bipolar` WRITE;
/*!40000 ALTER TABLE `bipolar` DISABLE KEYS */;
/*!40000 ALTER TABLE `bipolar` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `chats`
--

DROP TABLE IF EXISTS `chats`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `chats` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `module` varchar(50) DEFAULT 'general',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chats`
--

LOCK TABLES `chats` WRITE;
/*!40000 ALTER TABLE `chats` DISABLE KEYS */;
/*!40000 ALTER TABLE `chats` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `chats_old`
--

DROP TABLE IF EXISTS `chats_old`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `chats_old` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `module` varchar(50) DEFAULT 'general',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `chats_old_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chats_old`
--

LOCK TABLES `chats_old` WRITE;
/*!40000 ALTER TABLE `chats_old` DISABLE KEYS */;
/*!40000 ALTER TABLE `chats_old` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `depression`
--

DROP TABLE IF EXISTS `depression`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `depression` (
  `depression_id` int(11) NOT NULL AUTO_INCREMENT,
  `patient_id` int(11) NOT NULL,
  `conversation` text DEFAULT NULL,
  `s_module_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`depression_id`),
  KEY `patient_id` (`patient_id`),
  KEY `s_module_id` (`s_module_id`),
  CONSTRAINT `depression_ibfk_1` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`patient_id`) ON DELETE CASCADE,
  CONSTRAINT `depression_ibfk_2` FOREIGN KEY (`s_module_id`) REFERENCES `specialized_module` (`s_module_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `depression`
--

LOCK TABLES `depression` WRITE;
/*!40000 ALTER TABLE `depression` DISABLE KEYS */;
/*!40000 ALTER TABLE `depression` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `feedbacks`
--

DROP TABLE IF EXISTS `feedbacks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `feedbacks` (
  `feedback_id` int(11) NOT NULL AUTO_INCREMENT,
  `patient_id` int(11) NOT NULL,
  `feedbacks` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`feedback_id`),
  KEY `patient_id` (`patient_id`),
  CONSTRAINT `feedbacks_ibfk_1` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`patient_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `feedbacks`
--

LOCK TABLES `feedbacks` WRITE;
/*!40000 ALTER TABLE `feedbacks` DISABLE KEYS */;
/*!40000 ALTER TABLE `feedbacks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `general_module`
--

DROP TABLE IF EXISTS `general_module`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `general_module` (
  `g_module_id` int(11) NOT NULL AUTO_INCREMENT,
  `patient_id` int(11) NOT NULL,
  `conversation` text DEFAULT NULL,
  `therapy_type` varchar(100) DEFAULT NULL,
  `date` date DEFAULT NULL,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`g_module_id`),
  KEY `patient_id` (`patient_id`),
  CONSTRAINT `fk_gm_chats` FOREIGN KEY (`g_module_id`) REFERENCES `chats` (`id`) ON DELETE CASCADE,
  CONSTRAINT `general_module_ibfk_1` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`patient_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `general_module`
--

LOCK TABLES `general_module` WRITE;
/*!40000 ALTER TABLE `general_module` DISABLE KEYS */;
/*!40000 ALTER TABLE `general_module` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `messages`
--

DROP TABLE IF EXISTS `messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `messages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `chat_id` int(11) NOT NULL,
  `sender` enum('user','bot') NOT NULL,
  `text` text NOT NULL,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp(),
  `g_module_id` int(11) DEFAULT NULL,
  `s_module_id` int(11) DEFAULT NULL,
  `anxiety_id` int(11) DEFAULT NULL,
  `depression_id` int(11) DEFAULT NULL,
  `ocd_id` int(11) DEFAULT NULL,
  `bipolar_id` int(11) DEFAULT NULL,
  `phobias_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `chat_id` (`chat_id`),
  CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`chat_id`) REFERENCES `chats_old` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `messages`
--

LOCK TABLES `messages` WRITE;
/*!40000 ALTER TABLE `messages` DISABLE KEYS */;
/*!40000 ALTER TABLE `messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mood_detection`
--

DROP TABLE IF EXISTS `mood_detection`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `mood_detection` (
  `mod_id` int(11) NOT NULL AUTO_INCREMENT,
  `patient_id` int(11) NOT NULL,
  `mood_type` varchar(100) NOT NULL,
  `method` enum('face','voice','manual') DEFAULT 'manual',
  `result_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`result_data`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`mod_id`),
  KEY `patient_id` (`patient_id`),
  CONSTRAINT `mood_detection_ibfk_1` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`patient_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mood_detection`
--

LOCK TABLES `mood_detection` WRITE;
/*!40000 ALTER TABLE `mood_detection` DISABLE KEYS */;
/*!40000 ALTER TABLE `mood_detection` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mood_logs`
--

DROP TABLE IF EXISTS `mood_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `mood_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `mood_type` varchar(100) NOT NULL,
  `method` enum('face','voice') NOT NULL,
  `result_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`result_data`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `mood_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mood_logs`
--

LOCK TABLES `mood_logs` WRITE;
/*!40000 ALTER TABLE `mood_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `mood_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ocd`
--

DROP TABLE IF EXISTS `ocd`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ocd` (
  `ocd_id` int(11) NOT NULL AUTO_INCREMENT,
  `patient_id` int(11) NOT NULL,
  `conversation` text DEFAULT NULL,
  `s_module_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`ocd_id`),
  KEY `patient_id` (`patient_id`),
  KEY `s_module_id` (`s_module_id`),
  CONSTRAINT `ocd_ibfk_1` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`patient_id`) ON DELETE CASCADE,
  CONSTRAINT `ocd_ibfk_2` FOREIGN KEY (`s_module_id`) REFERENCES `specialized_module` (`s_module_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ocd`
--

LOCK TABLES `ocd` WRITE;
/*!40000 ALTER TABLE `ocd` DISABLE KEYS */;
/*!40000 ALTER TABLE `ocd` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `patients`
--

DROP TABLE IF EXISTS `patients`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `patients` (
  `patient_id` int(11) NOT NULL,
  `fullname` varchar(255) NOT NULL,
  `age` int(11) DEFAULT NULL,
  `gender` varchar(50) DEFAULT NULL,
  `email` varchar(191) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`patient_id`),
  CONSTRAINT `patients_ibfk_1` FOREIGN KEY (`patient_id`) REFERENCES `authentication` (`auth_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `patients`
--

LOCK TABLES `patients` WRITE;
/*!40000 ALTER TABLE `patients` DISABLE KEYS */;
INSERT INTO `patients` VALUES (2,'Test User',25,'Female','user@innerbloom.com','$2b$10$4dkxKYQZ9RLxhrh5xeguIOYRPjHCqY9ZASCJhwUp8gXvQILDMvn8G'),(3,'Boom',34,'Male','shakeel.skylinxtech@gmail.com','$2b$10$8D/zu6mQ0Nhu7rUGR6fsmeiKmDnofAne/IyVCcCmxiZzhMi.LyzGq'),(4,'Rauf',36,'Male','shakeel.skylinxtech+1@gmail.com','$2b$10$/8CaZoD7ziOZgTXW2aAzAunBhfeB2r3EXeHIaYJJssr4DjJR4ZVfK');
/*!40000 ALTER TABLE `patients` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `phobias`
--

DROP TABLE IF EXISTS `phobias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `phobias` (
  `phobias_id` int(11) NOT NULL AUTO_INCREMENT,
  `patient_id` int(11) NOT NULL,
  `conversation` text DEFAULT NULL,
  `s_module_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`phobias_id`),
  KEY `patient_id` (`patient_id`),
  KEY `s_module_id` (`s_module_id`),
  CONSTRAINT `phobias_ibfk_1` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`patient_id`) ON DELETE CASCADE,
  CONSTRAINT `phobias_ibfk_2` FOREIGN KEY (`s_module_id`) REFERENCES `specialized_module` (`s_module_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `phobias`
--

LOCK TABLES `phobias` WRITE;
/*!40000 ALTER TABLE `phobias` DISABLE KEYS */;
/*!40000 ALTER TABLE `phobias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `specialized_module`
--

DROP TABLE IF EXISTS `specialized_module`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `specialized_module` (
  `s_module_id` int(11) NOT NULL AUTO_INCREMENT,
  `patient_id` int(11) NOT NULL,
  `conversation` text DEFAULT NULL,
  `date` date DEFAULT NULL,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`s_module_id`),
  KEY `patient_id` (`patient_id`),
  CONSTRAINT `fk_sm_chats` FOREIGN KEY (`s_module_id`) REFERENCES `chats` (`id`) ON DELETE CASCADE,
  CONSTRAINT `specialized_module_ibfk_1` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`patient_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `specialized_module`
--

LOCK TABLES `specialized_module` WRITE;
/*!40000 ALTER TABLE `specialized_module` DISABLE KEYS */;
/*!40000 ALTER TABLE `specialized_module` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `gender` varchar(50) DEFAULT NULL,
  `age` int(11) DEFAULT NULL,
  `role` enum('user','admin') DEFAULT 'user',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `reset_token` varchar(255) DEFAULT NULL,
  `reset_expiry` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Admin User','admin@innerbloom.com','$2b$10$evvSFpuMnoVE0ANN6B9tvem.QEY3bMFTbg.yYTdNTmyZITQBMZdOa','Other',30,'admin','2026-03-20 05:52:57',NULL,NULL),(2,'Test User','user@innerbloom.com','$2b$10$4dkxKYQZ9RLxhrh5xeguIOYRPjHCqY9ZASCJhwUp8gXvQILDMvn8G','Female',25,'user','2026-03-20 05:52:57',NULL,NULL),(3,'Boom','shakeel.skylinxtech@gmail.com','$2b$10$8D/zu6mQ0Nhu7rUGR6fsmeiKmDnofAne/IyVCcCmxiZzhMi.LyzGq','Male',34,'user','2026-03-27 12:10:20',NULL,NULL),(4,'Rauf','shakeel.skylinxtech+1@gmail.com','$2b$10$/8CaZoD7ziOZgTXW2aAzAunBhfeB2r3EXeHIaYJJssr4DjJR4ZVfK','Male',36,'admin','2026-03-30 17:07:17',NULL,NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-09 21:33:59
