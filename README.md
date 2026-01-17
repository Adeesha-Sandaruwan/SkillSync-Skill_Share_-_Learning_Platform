# 🚀 SkillSync: Social Learning Ecosystem

![Java](https://img.shields.io/badge/Java-21-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.4.1-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

> **"Democratizing access to high-quality knowledge through a secure, scalable, and globally accessible peer-to-peer social learning ecosystem."**

---

## 🌐 Live Demo
👉 **[Visit SkillSync Live App](https://skillsyncfrontend.vercel.app/)**

---

## 📖 Project Overview

**SkillSync** is an industry-grade **Social Learning Platform** that unifies learning roadmap creation, content curation, community engagement, and progress tracking within a secure, cloud-native web application.

Moving beyond traditional LMS boundaries, SkillSync operates as a **knowledge marketplace** where learners can create structured **Learning Plans**, follow others' roadmaps, and track their growth via a **Gamified XP System**. By bridging the gap between self-learners and community validation, it fosters an environment defined by collaborative velocity and mutual professional growth.

### 🎯 Key Objectives
* **Bridge the Validation Gap:** Users build verifiable digital portfolios based on executed projects rather than static degrees.
* **Gamified Progression:** A robust XP and Leveling system motivates consistent study habits.
* **Real-Time Collaboration:** Instant WebSocket-powered chat and optimistic UI updates for seamless interaction.
* **Zero-Trust Security:** Strict OAuth2 authentication and Role-Based Access Control (RBAC) ensure data integrity.

---

## ✨ Core Features

### 🧠 **Learning & Roadmaps**
* **Interactive Learning Plans:** Create, clone, and follow structured roadmaps with milestones and resources.
* **Progress Tracking:** Visual timelines and step-by-step checklists to track completion rates.
* **Resource Library:** Curated links, videos, and documentation attachments.

### 💬 **Social & Engagement**
* **Community Feed:** A dynamic, algorithm-friendly feed for discovering new plans and updates.
* **Real-Time Chat:** Private messaging system powered by **WebSocket (Stomp/SockJS)**.
* **Interaction:** Rich engagement system including Likes, Comments (with edit history), and Follows.

### 🏆 **Gamification**
* **XP System:** Earn experience points for completing steps, creating plans, and engaging with the community.
* **Leaderboards:** Rank against other learners based on activity and contribution.
* **Profile Badges:** Visual indicators of user levels and achievements.

### 🛡️ **Security & Admin**
* **Authentication:** Secure Login via **Google OAuth2** and JWT (Stateless Session Management).
* **Admin Dashboard:** Oversight tools for content moderation and user management.
* **Data Privacy:** Strict CORS policies and input sanitization to prevent XSS/Injection attacks.

---

## 🛠 Tech Stack & Architecture

The application follows a **Three-Tier Microservices-Ready Architecture**:

### **Backend (Application Layer)**
* **Language:** Java 21 (LTS)
* **Framework:** Spring Boot 3.4.1
* **Security:** Spring Security 6 (OAuth2 + JWT)
* **Real-Time:** WebSocket (STOMP Protocol)
* **Database Access:** Spring Data JPA (Hibernate)
* **Hosting:** Koyeb (Cloud Native)

### **Frontend (Presentation Layer)**
* **Framework:** React.js (Vite)
* **Styling:** Tailwind CSS (Dark Mode Native)
* **State Management:** Context API
* **HTTP Client:** Axios (Interceptor-based Auth)
* **Hosting:** Vercel

### **Data & Infrastructure**
* **Database:** PostgreSQL (Hosted on Supabase)
* **Storage:** Cloud Storage for User Avatars/Media
* **CI/CD:** Automated pipelines via GitHub Actions (Vercel/Koyeb Webhooks)

---

## 📂 Project Structure

The backend adheres to a strictly layered **Package-by-Feature** architecture to ensure separation of concerns:

```text
src/main/java/com/learning/lms
├── config/             # Security (Cors, CSRF, JWT) & WebSocket Config
├── controller/         # REST API Controllers (Request Handling)
├── dto/                # Data Transfer Objects (Request/Response Records)
├── entity/             # JPA Entities (Database Schema Mapping)
├── exception/          # Global Exception Handler (@ControllerAdvice)
├── repository/         # Data Access Interfaces (Spring Data JPA)
├── service/            # Core Business Logic & Transaction Management
└── utils/              # Helper Classes (JwtUtils, DateUtils)

🚀 Getting Started (Local Development)
Follow these instructions to set up the project locally.

Prerequisites
Java JDK 21

Node.js (v18+)

PostgreSQL (Local or Cloud URL)

Maven

1. Backend Setup
Bash

# Clone the repository
git clone [https://github.com/your-username/skillsync-backend.git](https://github.com/your-username/skillsync-backend.git)
cd skillsync-backend

# Configure Database
# Edit src/main/resources/application.properties with your DB credentials:
# spring.datasource.url=jdbc:postgresql://localhost:5432/skillsync_db

# Run the application
mvn spring-boot:run
2. Frontend Setup
Bash

# Clone the repository
git clone [https://github.com/your-username/skillsync-frontend.git](https://github.com/your-username/skillsync-frontend.git)
cd skillsync-frontend

# Install dependencies
npm install

# Configure Environment
# Create a .env file and add:
# VITE_API_URL=http://localhost:8080/api

# Run the development server
npm run dev
🤝 Contributing
Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are greatly appreciated.

Fork the Project

Create your Feature Branch (git checkout -b feature/AmazingFeature)

Commit your Changes (git commit -m 'Add some AmazingFeature')

Push to the Branch (git push origin feature/AmazingFeature)

Open a Pull Request


<div align="center"> <p>Built with ❤️ for the Developer Community</p> </div>
