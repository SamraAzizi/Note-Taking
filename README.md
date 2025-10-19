# 📝 Notes App

A full-stack note-taking application built with React frontend and Flask backend. Organize your notes into notebooks, add tags, search through content, and never forget an idea again!

## 🚀 Features

### Core Functionality
- **Create, Read, Update, Delete** notes and notebooks
- **Organize notes** into colorful notebooks
- **Tag system** for better categorization
- **Star important notes** for quick access
- **Full-text search** across titles and content
- **Responsive design** that works on all devices

### User Interface
- **Modern, clean design** with intuitive navigation
- **Detail views** for focused reading and editing
- **Modal forms** for creating and editing content
- **Real-time statistics** dashboard
- **Color-coded notebooks** for visual organization

## 🛠️ Tech Stack

### Frontend
- **React** - UI framework
- **Vite** - Build tool and dev server
- **Axios** - HTTP client for API calls
- **CSS3** - Styling with modern features

### Backend
- **Flask** - Python web framework
- **SQLAlchemy** - ORM for database operations
- **SQLite** - Database (easy setup, file-based)
- **Flask-CORS** - Cross-origin resource sharing

## 📁 Project Structure
```bash
notetaking/
├── backend/
│ ├── app.py # Main Flask application
│ ├── database.py # Database initialization
│ ├── models.py # SQLAlchemy models
│ └── requirements.txt # Python dependencies
└── frontend/
├── src/
│ ├── App.jsx # Main React component
│ ├── main.jsx # React entry point
│ └── index.css # Stylesheets
├── index.html # HTML template
├── package.json # Node.js dependencies
└── vite.config.js # Vite configuration
```


## 🚀 Quick Start

### Prerequisites
- **Node.js** (v14 or higher)
- **Python** (v3.7 or higher)
- **npm** or **yarn** package manager

### Installation & Running

1. **Clone or download the project**
   ```bash
   cd notetaking
   ```

2. **Backend**
    ```bash
    cd backend
    pip install -r requirements.txt
    python app.py
    ```
    Backend will run on: `http://localhost:5000`

2. **Frontend Setup (in a new terminal)**

    ```bash
    cd frontend
    npm install
    npm run dev
    ```
    Frontend will run on: `http://localhost:5173`

4. **Access the Application**
    Open your browser and go to: `http://localhost:5173`

## How to Use

### Creating Content

1. Create a Notebook: Click "+ New Notebook", choose a name and color
2. Create a Note: Click "+ New Note", add title, content, and select notebook
3. Add Tags: Use the tags field to categorize notes (comma separated)