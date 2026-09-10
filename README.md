# RSVPify Invite - React App

A beautiful, responsive React invitation app with mobile blocking.

## Features

- 📱 **Responsive Design** - Beautiful landscape layout for desktop
- 🚫 **Mobile Blocking** - Prevents access on mobile devices with friendly message
- 💌 **Animated Envelope** - Jiggles every 5 seconds for attention
- 🎨 **RSVPify Branding** - Full brand color integration
- ⚛️ **Pure React** - No Cloudflare dependencies

## Getting Started

### Prerequisites

- Node.js 14+
- npm or yarn

### Installation

```bash
npm install
```

### Running the App

```bash
npm start
```

Opens [http://localhost:3000](http://localhost:3000) to view it in the browser.

### Building for Production

```bash
npm run build
```

Builds the app for production to the `build` folder.

## Adding Your Download Link

To add your custom download link, modify the `accept-btn` button in `src/App.jsx`:

```jsx
<a href="YOUR_DOWNLOAD_URL" className="accept-btn">
  Accept & Join
</a>
```

Or add an onClick handler:

```jsx
<button className="accept-btn" onClick={() => window.location.href = 'YOUR_DOWNLOAD_URL'}>
  Accept & Join
</button>
```

## Project Structure

```
src/
├── App.jsx       # Main React component
├── App.css       # All styling
└── index.js      # React entry point

public/
└── index.html    # HTML template
```

## Customization

### Colors

All colors are defined in `src/App.css`. The primary color is `#6366f1` (indigo).

### Logo

Change the logo URL in `src/App.jsx`:

```jsx
<img
  src="YOUR_LOGO_URL"
  alt="Your Brand"
/>
```

### Text Content

Edit the text directly in the `Invite()` component in `src/App.jsx`.

## Deployment

### Deploy to Vercel (Recommended)

```bash
npm i -g vercel
vercel
```

### Deploy to Netlify

```bash
npm i -g netlify-cli
netlify deploy --prod --dir=build
```

### Deploy to GitHub Pages

1. Add to `package.json`:
   ```json
   "homepage": "https://yourusername.github.io/repo-name"
   ```

2. Run:
   ```bash
   npm run build
   ```

3. Push `build` folder to gh-pages branch

## License

MIT
