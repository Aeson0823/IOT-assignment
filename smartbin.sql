-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- 主機： 127.0.0.1:3306
-- 產生時間： 2025 年 11 月 18 日 07:45
-- 伺服器版本： 8.0.31
-- PHP 版本： 8.0.26

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- 資料庫： `smartbin`
--

-- --------------------------------------------------------

--
-- 資料表結構 `bin`
--

DROP TABLE IF EXISTS `bin`;
CREATE TABLE IF NOT EXISTS `bin` (
  `BinID` varchar(10) CHARACTER SET armscii8 COLLATE armscii8_bin NOT NULL,
  `UserID` varchar(10) CHARACTER SET armscii8 COLLATE armscii8_bin NOT NULL,
  `Location` varchar(180) CHARACTER SET armscii8 COLLATE armscii8_bin NOT NULL,
  `Created_at` timestamp NOT NULL,
  `BinLevel` varchar(10) CHARACTER SET armscii8 COLLATE armscii8_bin NOT NULL,
  `Timestamp` timestamp NOT NULL,
  PRIMARY KEY (`BinID`),
  KEY `UserID` (`UserID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- 資料表結構 `user`
--

DROP TABLE IF EXISTS `user`;
CREATE TABLE IF NOT EXISTS `user` (
  `UserID` varchar(10) CHARACTER SET armscii8 COLLATE armscii8_bin NOT NULL,
  `FullName` varchar(180) CHARACTER SET armscii8 COLLATE armscii8_bin NOT NULL,
  `Email` varchar(180) CHARACTER SET armscii8 COLLATE armscii8_bin NOT NULL,
  `PhoneNo` varchar(20) CHARACTER SET armscii8 COLLATE armscii8_bin NOT NULL,
  `Username` varchar(180) CHARACTER SET armscii8 COLLATE armscii8_bin NOT NULL,
  `Password` varchar(180) CHARACTER SET armscii8 COLLATE armscii8_bin NOT NULL,
  PRIMARY KEY (`UserID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- 已傾印資料表的限制式
--

--
-- 資料表的限制式 `bin`
--
ALTER TABLE `bin`
  ADD CONSTRAINT `bin_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `user` (`UserID`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
