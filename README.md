# MediCare HMS

## Overview

MediCare HMS is a modern Hospital Management System designed to streamline healthcare operations through a secure, scalable, and responsive web application. The system simplifies the management of patients, doctors, appointments, admissions, billing, and hospital resources while providing role-based access and real-time insights through an intuitive dashboard.

Built using **ASP.NET Core Web API** and **React**, the project follows **Clean Architecture** principles to ensure maintainability, scalability, and separation of concerns.

## Features

* Secure JWT-based authentication and authorization
* Role-based access control
* Patient, doctor, and staff management
* Appointment scheduling and tracking
* Ward, bed, and admission management
* Invoice and billing management
* Hospital settings management
* Audit logging
* Interactive dashboard with analytics and charts
* Responsive user interface
* Form validation and error handling

## Technology Stack

### Backend

* C#
* .NET 10
* ASP.NET Core Web API
* Entity Framework Core 10
* PostgreSQL (Npgsql)
* AutoMapper
* JWT Authentication
* BCrypt.Net

### Frontend

* React 19
* TypeScript
* Vite
* Tailwind CSS v4
* TanStack React Query
* Framer Motion
* Recharts

## Architecture

The backend follows the **Clean Architecture** pattern, separating the application into independent layers to improve scalability, maintainability, and testability.

### Domain

Contains the core business logic and domain entities.

* Patient
* Doctor
* Staff
* Appointment
* Ward
* Bed
* Admission
* Invoice
* Hospital Settings
* Audit Log

### Application

Contains business rules, DTOs, validation, services, and application use cases.

### Infrastructure

Handles database configuration, repositories, authentication, persistence, and external services.

### API

Exposes RESTful endpoints and manages authentication, authorization, middleware, dependency injection, and request handling

## Project Structure

MediCare-HMS/
│
├── backend/
│   ├── HospitalMS.Api/
│   ├── HospitalMS.Application/
│   ├── HospitalMS.Domain/
│   ├── HospitalMS.Infrastructure/
│   └── HospitalMS.sln
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── README.md
└── .gitignore

## Installation

### Clone the repository

git clone https://github.com/rameesa44/MediCare-HMS.git

### Navigate to the project

cd MediCare-HMS

### Backend

cd backend
dotnet restore
dotnet run

### Frontend

cd frontend
npm install
npm run dev

## Key Modules

* Authentication & Authorization
* Dashboard
* Patient Management
* Doctor Management
* Staff Management
* Appointment Management
* Ward & Bed Management
* Admission Management
* Billing & Invoicing
* Hospital Settings
* Audit Logs

---

