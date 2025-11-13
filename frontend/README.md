# Library Manager - Frontend

React + Vite + TypeScript + Shadcn/UI frontend application.

## 🚀 Quick Start

```bash
# Install dependencies
yarn

# Run development server
yarn dev

# Build for production
yarn build

# Preview production build
yarn preview
```

## 📦 Scripts

- `yarn dev` - Start development server (http://localhost:5173)
- `yarn build` - Build for production
- `yarn preview` - Preview production build
- `yarn lint` - Run ESLint

## 🎨 UI Components

This project uses **Shadcn/UI** components with TailwindCSS:

- Button
- Card
- Input
- Label
- Select
- Table
- Dialog

All components are located in `src/components/ui/`

## 📂 Project Structure

```
src/
├── api/              # API client and services
├── components/       # React components
│   ├── ui/          # Shadcn/UI components
│   └── Layout.tsx   # Main layout
├── pages/           # Page components
├── lib/             # Utility functions
├── App.tsx          # Main app component
├── main.tsx         # Entry point
└── index.css        # Global styles
```

## 🔌 API Configuration

The API base URL is configured in `src/api/client.ts`:

```typescript
const API_BASE_URL = 'http://localhost:8000';
```

Update this if your backend runs on a different port.

## 🎯 Features

- ✅ Books management with CRUD operations
- ✅ Members management
- ✅ Loan/return functionality
- ✅ Real-time search and filtering
- ✅ Toast notifications
- ✅ Form validation
- ✅ Responsive design
- ✅ Loading states
- ✅ Error handling

## 🛠️ Technologies

- **React 18** - UI library
- **Vite** - Build tool
- **TypeScript** - Type safety
- **React Router** - Routing
- **Axios** - HTTP client
- **TailwindCSS** - Styling
- **Shadcn/UI** - UI components
- **Lucide React** - Icons
- **React Hot Toast** - Notifications
