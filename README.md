# SkillSync - Skill-Sharing & Learning Platform

SkillSync is a comprehensive Learning Management System (LMS) designed to foster a community of continuous learners. It allows users to share skills, track learning progress, create structured learning plans, and engage socially through a robust, interactive platform.

## 🚀 Project Overview

This application is built as a full-stack solution using **Java Spring Boot** for the backend and **React** for the frontend, utilizing **PostgreSQL** for persistent data storage. It is designed with a scalable Layered Architecture adhering to REST API best practices.

### Key Features

* **Skill Sharing Posts:** Users can upload posts with descriptions and multimedia content (up to 3 photos/videos).
* **Learning Plans:** Structured roadmap creation with topics, resources, and timelines.
* **Progress Tracking:** Users can post updates using predefined templates to track their journey.
* **Social Interactivity:** Full engagement system allowing likes and comments. Comments support editing and deletion.
* **User Profiles:** Public profiles displaying skill posts, activities, and following/follower networks.
* **Notifications:** Real-time system notifications for engagement events.
* **Secure Authentication:** OAuth 2.0 integration for secure social login.

## 🛠 Tech Stack

### Backend
* **Language:** Java 21
* **Framework:** Spring Boot 3.4.1
* **Build Tool:** Maven
* **Database:** PostgreSQL
* **Security:** Spring Security & OAuth2 Client
* **ORM:** Spring Data JPA (Hibernate)

### Frontend
* **Library:** React.js
* **Styling:** tailwind / Styled Components
* **State Management:** Context API / Redux
* **HTTP Client:** Axios

## 📂 Project Structure

The backend follows a strict **Package by Feature** layered architecture to ensure separation of concerns and maintainability.

```text
src/main/java/com/learning/lms
├── config/          # Security and Application Configuration
├── controller/      # REST API Controllers (Web Layer)
├── dto/             # Data Transfer Objects
├── entity/          # JPA Entities (Database Model)
├── exception/       # Global Exception Handling
├── repository/      # Data Access Layer (Interfaces)
└── service/         # Business Logic Layer