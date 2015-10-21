--
-- Table structure for table `bookmarks`
--

DROP TABLE IF EXISTS `bookmarks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `bookmarks` (
  `bookmarkid` bigint(20) NOT NULL AUTO_INCREMENT,
  `screenid` bigint(20) DEFAULT NULL,
  `userid` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`bookmarkid`),
  KEY `fk_bookmarks_screens` (`screenid`),
  KEY `fk_bookmarks_users` (`userid`),
  CONSTRAINT `fk_bookmarks_screens` FOREIGN KEY (`screenid`) REFERENCES `screens` (`screenid`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT `fk_bookmarks_users` FOREIGN KEY (`userid`) REFERENCES `users` (`userid`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `graphs`
--

DROP TABLE IF EXISTS `graphs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `graphs` (
  `graphid` bigint(20) NOT NULL AUTO_INCREMENT,
  `width` varchar(10) NOT NULL,
  `height` varchar(10) NOT NULL,
  `top` varchar(10) NOT NULL,
  `left` varchar(10) NOT NULL,
  `url` text NOT NULL,
  `screenid` bigint(20) NOT NULL,
  PRIMARY KEY (`graphid`),
  KEY `fk_graphs_screens` (`screenid`),
  CONSTRAINT `fk_graphs_screens` FOREIGN KEY (`screenid`) REFERENCES `screens` (`screenid`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=831 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `screens`
--

DROP TABLE IF EXISTS `screens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `screens` (
  `screenid` bigint(20) NOT NULL AUTO_INCREMENT,
  `screentiny` varchar(6) NOT NULL,
  `screenname` varchar(255) NOT NULL,
  `userid` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`screenid`),
  KEY `fk_screens_userid` (`userid`),
  CONSTRAINT `fk_screens_userid` FOREIGN KEY (`userid`) REFERENCES `users` (`userid`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=76 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `userid` bigint(20) NOT NULL AUTO_INCREMENT,
  `username` varchar(100) NOT NULL,
  PRIMARY KEY (`userid`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

