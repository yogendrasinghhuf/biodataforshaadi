# 🚀 Quick Start Guide - Shaadi Biodata Project

## ✅ Installation Complete!

Your project is ready to use at:
- **Windows Path:** `C:\Personal\Ubuntu claude code\shaadibiodata1`
- **WSL Path:** `/mnt/c/Personal/Ubuntu claude code/shaadibiodata1`

---

## 🎯 How to Start the Application

### Option 1: From Windows (Command Prompt/PowerShell)

```cmd
# Navigate to project
cd "C:\Personal\Ubuntu claude code\shaadibiodata1"

# Start Frontend (Port 3000)
cd frontend
npm start

# In another terminal, start Backend (Port 5000)
cd "C:\Personal\Ubuntu claude code\shaadibiodata1\server"
npm start
```

### Option 2: From WSL Terminal

```bash
# Navigate to project
cd "/mnt/c/Personal/Ubuntu claude code/shaadibiodata1"

# Start Frontend
cd frontend
npm start

# In another terminal, start Backend
cd "/mnt/c/Personal/Ubuntu claude code/shaadibiodata1/server"
npm start
```

### Option 3: From VS Code

1. Open VS Code
2. File → Open Folder → `C:\Personal\Ubuntu claude code\shaadibiodata1`
3. Open Terminal (Ctrl + `)
4. Follow Option 1 or 2 commands above

---

## 🌐 Access the Application

Once both frontend and backend are running:

- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:5000

---

## 📁 Project Structure

```
shaadibiodata1/
├── frontend/               # React frontend application
│   ├── src/
│   │   ├── pages/         # Page components
│   │   │   ├── CreateBiodataNew.tsx  # Main biodata creation page
│   │   │   ├── CreateBiodataNew.css  # Styles
│   │   │   └── Preview.tsx           # Preview & download page
│   │   ├── data/          # Data files
│   │   │   ├── templates.ts          # Template configurations
│   │   │   └── religionFields.ts     # Form field definitions
│   │   └── components/    # Reusable components
│   └── package.json
│
└── server/                 # Node.js backend
    ├── index.js           # Server entry point
    ├── .env              # Environment variables
    └── package.json
```

---

## ✨ Latest Features

Your project includes all the latest updates:

✅ **Header Customization**
- Toggle Shree Ganesh text
- Toggle BIO DATA text
- God icon selector (15 icons)
- Editable header texts

✅ **Height Dropdown**
- Range: 3 ft 5 inch to 7 ft 8 inch
- Increments: 1 inch
- Shows CM in brackets

✅ **Template #1: Classic Black & White**
- Simple black & white design
- Light grey double borders
- Clean, elegant look

✅ **Preview Section**
- Live preview of biodata
- Sticky scroll behavior
- Clear, readable text (0.75rem font size)

✅ **Better Text Rendering**
- No blur issues
- Optimized font smoothing
- Larger preview height (500-700px)

---

## 🛠️ Common Commands

```bash
# Install dependencies (already done)
cd frontend && npm install
cd ../server && npm install

# Start development servers
npm start

# Build for production
npm run build

# Run tests
npm test
```

---

## 📝 Notes

- **node_modules/** folders are installed and ready
- All latest changes are included
- Project is configured for both Windows and WSL access
- No files are missing - everything copied successfully

---

## 🆘 Troubleshooting

### Port Already in Use
```bash
# Find process on port 3000
lsof -i :3000  # Linux/WSL
netstat -ano | findstr :3000  # Windows

# Kill process
kill -9 <PID>  # Linux/WSL
taskkill /F /PID <PID>  # Windows
```

### Dependencies Issue
```bash
# Clear cache and reinstall
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Permission Denied (WSL)
```bash
# Fix permissions
sudo chown -R $USER:$USER "/mnt/c/Personal/Ubuntu claude code/shaadibiodata1"
```

---

## 📧 Need Help?

Working directory is configured at:
`/mnt/c/Personal/Ubuntu claude code/shaadibiodata1`

You can now work directly from this location!

---

**Ready to start?** Run `npm start` in the frontend folder! 🚀
