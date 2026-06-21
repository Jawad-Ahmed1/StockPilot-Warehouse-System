# SmartWarehouse Frontend

A modern React homepage for the AI Smart Warehouse Management System. Built with Vite, React 18, and featuring a professional, responsive design.

## Features

- **Responsive Design**: Mobile-first, works on all screen sizes
- **Modern UI**: Clean, professional interface highlighting warehouse management features
- **AI-Powered**: Showcase of demand forecasting, stock prediction, and intelligent recommendations
- **Fast Performance**: Optimized with Vite for instant HMR and fast builds
- **Accessible**: WCAG-compliant components and semantic HTML

## Project Structure

```
warehouse-frontend/
├── src/
│   ├── components/          # Reusable React components
│   │   ├── Header.jsx
│   │   ├── HeroSection.jsx
│   │   ├── FeaturesSection.jsx
│   │   ├── AICapabilitiesSection.jsx
│   │   ├── BenefitsSection.jsx
│   │   ├── CallToActionSection.jsx
│   │   └── Footer.jsx
│   ├── pages/              # Page components
│   │   └── HomePage.jsx
│   ├── App.jsx             # Root component
│   ├── App.css
│   ├── main.jsx
│   └── index.css
├── public/                 # Static assets
├── index.html
├── package.json
├── vite.config.js
└── .gitignore
```

## Getting Started

### Prerequisites

- Node.js 16.0 or higher
- npm or yarn

### Installation

```bash
# Navigate to the project directory
cd warehouse-frontend

# Install dependencies
npm install
```

### Development

Run the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Production Build

Create an optimized production build:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Key Sections

### Header
- Sticky navigation with logo and menu
- Mobile hamburger menu
- Login and Get Started CTA buttons

### Hero Section
- Eye-catching gradient background
- Product value proposition
- Call-to-action buttons
- Key metrics display

### Features Section
- Grid layout highlighting 6 core features
- Icons from Lucide React
- Hover animations

### AI Capabilities
- Showcase of 4 AI-powered features
- Demand forecasting
- Fast-selling detection
- Trend analysis
- Smart recommendations

### Benefits Section
- Side-by-side layout with animated graphics
- 4 key benefits with icons
- Interactive visual elements

### Call-to-Action Section
- Prominent action buttons
- Trial information

### Footer
- Company information
- Links to product features
- Social media links
- Legal and resource links

## Color Scheme

- Primary: #2563eb (Blue)
- Secondary: #1e40af (Dark Blue)
- Accent: #f59e0b (Amber)
- Success: #10b981 (Green)
- Danger: #ef4444 (Red)
- Background Light: #f9fafb

## Dependencies

- **React**: 18.3.1 - User interface library
- **React DOM**: 18.3.1 - React rendering
- **Lucide React**: 0.263.1 - Icon library
- **Vite**: 5.0.8 - Build tool and dev server

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Responsive Breakpoints

- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

## Future Enhancements

- [ ] Add routing for additional pages
- [ ] Implement form validation
- [ ] Add animations and transitions
- [ ] Integrate with backend API
- [ ] Add authentication flow
- [ ] Create admin dashboard
- [ ] Implement dark mode
- [ ] Add internationalization (i18n)

## Contributing

Guidelines for contributing to this project will be added here.

## License

This project is part of the AI Smart Warehouse System semester project.

---

**Built with ❤️ for warehouse managers worldwide**
