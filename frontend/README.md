# Rently frontend

A simple React app using JavaScript, JSX, plain CSS, and the existing React Router.

## Run locally

```bash
cd frontend
npm ci
npm run dev
```

Open the address printed by Vite. Run `npm run build` to create a production build.

## Client structure

```text
src/
  components/client/
    ClientHeader.jsx         Shared navigation
    ClientFooter.jsx         Shared footer
    VehicleCard.jsx          Reusable vehicle display (receives a vehicle prop)
  pages/client/
    ClientLayout.jsx         Header, current page, and footer
    Clienthome.jsx           Home page
    ClientVehicles.jsx       Vehicle list and search using useState
    ClientVehicleDetails.jsx Vehicle details using the URL id
  data/
    vehicles.js              Sample vehicles; edit these to practice
  styles/
    client.css               Responsive client styles
  App.jsx                    Client and existing admin routes
```

## Pages

- `/`: customer home
- `/vehicles`: searchable catalogue
- `/vehicles/1`: sample vehicle details
- `/admin`: existing protected admin area
- `/login`: existing authentication page

Start by editing `Clienthome.jsx`. Keep reusable interface pieces in
`components/client` and full pages in `pages/client`. Pass data through props;
use `useState` when a page needs to remember input. Client CSS is scoped under
`.client-app` to avoid affecting admin pages.

The catalogue uses sample prices in MAD. It does not fetch availability or
create reservations. When the backend is ready, add a vehicle API file in the
existing `services` folder and replace the sample data. A booking page can be
the next step after the catalogue.
