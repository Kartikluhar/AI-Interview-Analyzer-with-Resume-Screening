# 🚀 Running the Project

## 1. Clone the Repository

```bash
git clone https://github.com/Kartikluhar/AI-Interview-Analyzer-with-Resume-Screening.git
cd AI-Interview-Analyzer-with-Resume-Screening
```

---

## 2. Backend Setup

Open a terminal and navigate to the backend:

```bash
cd backend
```

### Create a Virtual Environment

**Windows**

```bash
python -m venv venv
```

**Linux/macOS**

```bash
python3 -m venv venv
```

### Activate the Virtual Environment

**Windows**

```bash
venv\Scripts\activate
```

**Linux/macOS**

```bash
source venv/bin/activate
```

### Install Python Dependencies

```bash
pip install -r requirements.txt
```

### Create the Environment File

Create a file named `.env` inside the `backend` folder.

Example:

```env
SECRET_KEY=your_secret_key
GEMINI_API_KEY=your_api_key
EMAIL_HOST_USER=your_email@gmail.com
EMAIL_HOST_PASSWORD=your_email_app_password
```

> Replace the values with your own credentials.

### Apply Database Migrations

```bash
python manage.py migrate
```

### Start the Django Server

```bash
python manage.py runserver
```

The backend will be available at:

```
http://127.0.0.1:8000
```

Keep this terminal running.

---

## 3. Frontend Setup

Open a **new terminal**.

Navigate to the frontend:

```bash
cd frontend2/frontend
```

### Install Node Packages

```bash
npm install
```

### Start the Frontend

If you're using **Create React App**:

```bash
npm start
```

If you're using **Vite**:

```bash
npm run dev
```

The frontend will be available at the URL shown in the terminal (typically `http://localhost:3000` for Create React App or `http://localhost:5173` for Vite).

Keep this terminal running.

---

## 4. Running the Project

Both servers must be running simultaneously.

**Terminal 1**

```bash
cd backend
venv\Scripts\activate
python manage.py runserver
```

**Terminal 2**

```bash
cd frontend2/frontend
npm install
npm start
```

> If you're using Vite, replace `npm start` with `npm run dev`.

---

## 5. Common Commands

### Update Backend Dependencies

```bash
pip freeze > requirements.txt
```

### Install a New Frontend Package

```bash
npm install <package-name>
```

### Install a New Backend Package

```bash
pip install <package-name>
pip freeze > requirements.txt
```