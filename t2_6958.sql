-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 01, 2023 at 01:31 PM
-- Server version: 10.4.24-MariaDB
-- PHP Version: 7.4.29

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `t2_6958`
--
CREATE DATABASE IF NOT EXISTS `t2_6958` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `t2_6958`;

-- --------------------------------------------------------

--
-- Table structure for table `lecturers`
--

CREATE TABLE IF NOT EXISTS `lecturers` (
  `id_lecturer` varchar(6) NOT NULL,
  `nama_lengkap` varchar(50) NOT NULL,
  `email` varchar(50) NOT NULL,
  `jenis_kelamin` varchar(1) NOT NULL,
  PRIMARY KEY (`id_lecturer`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `lecturers`
--

INSERT INTO `lecturers` (`id_lecturer`, `nama_lengkap`, `email`, `jenis_kelamin`) VALUES
('DOS001', 'Eduardo', 'eduardo@stts.edu', 'L'),
('DOS002', 'Beethoven', 'beethoven@stts.edu', 'L'),
('DOS003', 'Mozart', 'mozart@stts.edu', 'L');

-- --------------------------------------------------------

--
-- Table structure for table `mahasiswa`
--

CREATE TABLE IF NOT EXISTS `mahasiswa` (
  `id_mhs` varchar(6) NOT NULL,
  `nrp` varchar(9) NOT NULL,
  `nama_lengkap` varchar(50) NOT NULL,
  `jurusan` varchar(30) NOT NULL,
  `email` varchar(50) NOT NULL,
  `jenis_kelamin` varchar(1) NOT NULL,
  `tanggal_lahir` varchar(10) NOT NULL,
  PRIMARY KEY (`id_mhs`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `mahasiswa`
--

INSERT INTO `mahasiswa` (`id_mhs`, `nrp`, `nama_lengkap`, `jurusan`, `email`, `jenis_kelamin`, `tanggal_lahir`) VALUES
('MHS001', '221116958', 'Geovann Chandra', 'S1 Informatika', 'geovann.c21@mhs.istts.ac.id', 'L', '30/06/2003'),
('MHS002', '219116798', 'Ignacio Varga', 'S1 Informatika', 'ignacio.v20@mhs.istts.ac.id', 'L', '09/12/2001'),
('MHS003', '597978504', 'Albert Einstein', 'S3 Physics and Mathematics', 'einstein.emc2@zurich.ac.sw', 'L', '14/03/1879');

-- --------------------------------------------------------

--
-- Table structure for table `proposals`
--

CREATE TABLE IF NOT EXISTS `proposals` (
  `id_proposal` varchar(6) NOT NULL,
  `judul_ta` varchar(255) NOT NULL,
  `id_mhs` varchar(6) NOT NULL,
  `id_pembimbing` varchar(6) NOT NULL,
  `id_co_pembimbing` varchar(6) NOT NULL,
  `periode` varchar(6) NOT NULL,
  `status` varchar(10) NOT NULL,
  `comment` varchar(255) NOT NULL,
  PRIMARY KEY (`id_proposal`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `proposals`
--

INSERT INTO `proposals` (`id_proposal`, `judul_ta`, `id_mhs`, `id_pembimbing`, `id_co_pembimbing`, `periode`, `status`, `comment`) VALUES
('PTA001', 'Segmentasi dan Klasifikasi Citra MRI Axial dan Sagital untuk Deteksi Luka pada Spinal CordASasd', 'MHS001', 'DOS002', 'DOS003', '202212', 'PENDING', ''),
('PTA002', 'Pemanfaatan AI dalam membangun bangunan secara masal', 'MHS002', 'DOS003', 'DOS001', '202105', 'PENDING', ''),
('PTA003', 'ADA UNTUK DIHAPUS', 'MHS001', 'DOS001', 'DOS003', '202208', 'PENDING', ''),
('PTA004', 'A New Determination of Molecular Dimensions', 'MHS003', 'DOS001', 'DOS002', '190504', 'PENDING', '');
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
