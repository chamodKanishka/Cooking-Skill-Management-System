# Cooking Skill Management System

## Project Structure

```
CookingSkillManagementSystem/
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/paf/cookingapp/demo/
│   │   │   │   ├── config/
│   │   │   │   ├── controller/
│   │   │   │   ├── model/
│   │   │   │   ├── repository/
│   │   │   │   ├── service/
│   │   │   │   └── DemoApplication.java
│   │   │   └── resources/
│   │   │       └── application.properties
│   │   └── test/
│   └── pom.xml
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   │   ├── images/
│   │   │   └── styles/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   └── layout/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── App.js
│   │   └── index.js
│   ├── package.json
│   └── README.md
│
└── README.md
```

## Backend Structure
- `config/` - Configuration files
- `controller/` - REST API controllers
- `model/` - Domain models/entities
- `repository/` - Database repositories
- `service/` - Business logic services

## Frontend Structure
- `assets/` - Static files (images, styles)
- `components/` - Reusable React components
- `pages/` - Page components
- `services/` - API service calls
- `utils/` - Helper functions and utilities