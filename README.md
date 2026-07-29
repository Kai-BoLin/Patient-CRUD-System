# FHIR Patient CRUD System

A practice project for learning HL7 FHIR Patient Resource CRUD operations using Vanilla JavaScript and HAPI FHIR Server.

## Features

- Create Patient Resource
- Search Patient Resource
- Update Patient Resource
- Delete Patient Resource

## Tech Stack

- HTML5
- CSS3
- Vanilla JavaScript (ES6)
- RESTful API
- HAPI FHIR Server
- Git / GitHub

## What I Learned

- Understand the structure of FHIR Patient Resource
- Practice RESTful API communication
- Implement CRUD operations using JavaScript
- Improve frontend modularization and code organization

## Future Improvements

- Form validation
- Better UI/UX
- Responsive design
- Pagination for patient search


## Project Structure

```text
FHIR-PATIENT-CRUD
│
├── CSS
├── JS
│   ├── create.js
│   ├── search.js
│   ├── update.js
│   └── delete.js
├── images
├── patient.html
└── README.md
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /Patient/{id} | Search patient |
| POST | /Patient | Create patient |
| PUT | /Patient/{id} | Update patient |
| DELETE | /Patient/{id} | Delete patient |

## Screenshots

### Patient Dashboard

![Patient Dashboard](images/01-patient-dashboard.png)

---

### Create Patient

![Create Patient](images/02-create-patient-form.png)

---

### Update Patient

![Update Patient](images/05-update-patient-success.png)

---

### Delete Patient

![Delete Patient](images/06-delete-patient-confirm.png)

## Workflow

1. Search patient by Patient ID
2. Create a new patient
3. Update patient information
4. Delete patient resource
