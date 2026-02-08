# Mocha

A modern, configurable static website for your furry friend, built with [Eleventy](https://www.11ty.dev).

## Features

- Clean, modern minimal design with dark/light theme support
- Responsive and consistent layout across desktop and mobile
- Configurable via user-supplied JSON data files and optional photos
- Auto-calculated age from date of birth
- Health records pertaining to vaccinations, conditions, allergies, medications, and more
- Automatic image optimisation in production (`WebP` + `JPEG` at responsive sizes)
- Container-ready for production deployment

## Development

### Prerequisites

- [Node.js](https://nodejs.org) 22.2.0 or higher

### Getting started

```sh
# Install dependencies
npm install

# Start development server
npm run start
```

By default, the development site will be available at `http://localhost:8080`.

### Production build

Pre-build optimised static files for deployment:

```sh
# Build site for production
npm run build
```

Built files will be in the `dist/` directory, ready for:

- _Lean_ (Docker) deployment (mount `dist/` to container)
- Static hosting services (Netlify, Vercel, GitHub Pages, etc.)
- Manual deployment to any web server (Apache, Nginx, etc.)

### References

Available scripts:

| Script | Description |
|--------|-------------|
| `npm run start` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm run build:docker` | Build for Docker (no pre-clean) |
| `npm run clean` | Remove the `dist/` directory |

Project structure:

```
mocha/
├── src/
│   ├── data/               # JSON configuration files
│   │   ├── data.js         # Data aggregator
│   │   ├── health.json     # Health records
│   │   ├── owner.json      # Owner contact details
│   │   ├── pet.json        # Pet information
│   │   └── site.json       # Site metadata
│   ├── assets/
│   │   ├── styles/         # SCSS stylesheets
│   │   ├── scripts/        # JavaScript
│   │   ├── images/         # Pet photos and logo
│   │   └── public/         # Static files (robots.txt)
│   ├── views/              # Page templates
│   └── includes/           # Reusable components
├── scripts/                # Eleventy filters and utilities
├── Dockerfile              # Production container (runtime build)
├── Dockerfile.lean         # Lightweight container (pre-built)
├── entrypoint.sh           # Container entrypoint script
├── packages.txt            # Alpine packages for Docker
└── package.json
```

## Deployment

### Container images

Two Dockerfiles are provided:

| File | Use case | Build time | Personalisation |
|------|----------|------------|-----------------|
| `Dockerfile` | Standard deployment | At runtime | By supplying [source data and image files](#configuration) |
| `Dockerfile.lean` | Pre-built site | At image build | By supplying [pre-built `dist` directory](#production-build) |

You could build either of these images yourself, locally:

```sh
# Standard image
docker build -t mocha .

# Lean image
docker build -f Dockerfile.lean -t mocha-lean .
```

**Alternatively**, use the pre-built images from our container registry **(Recommended)**:

- `ghcr.io/irfanhakim-as/mocha:latest`
- `ghcr.io/irfanhakim-as/mocha-lean:latest`

### Docker

Standard deployment (i.e. site built at runtime):

```sh
# To run with default source data
docker run -p 8080:80 mocha

# To run with custom data
docker run -p 8080:80 \
  -v /path/to/data:/config/data:ro \
  -v /path/to/images:/config/images:ro \
  mocha
```

Lean deployment (i.e. pre-built site):

```sh
# To run with default pre-built site
docker run -p 8080:80 mocha-lean

# To run with custom pre-built site
docker run -p 8080:80 \
  -v /path/to/dist:/app/dist:ro \
  mocha-lean
```

### Docker Compose

Create a compose file (i.e. `docker-compose.yml`):

```yaml
name: mocha
services:
  mocha:
    container_name: mocha
    image: mocha
    # image: mocha-lean # switch to this for lean deployment
    ports:
      - 8080:80
    volumes:
      - ./path/to/data:/config/data:ro
      - ./path/to/images:/config/images:ro
      # - ./path/to/dist:/app/dist:ro # switch to this for lean deployment
    restart: unless-stopped
```

Run compose file:

```sh
docker compose -f docker-compose.yml up -d --force-recreate
```

### Configuration

For supplying your own [source data](#source-data) and [images](#adding-photos) (optional) in the standard deployment, structure your config directory as follows:

```
/path/to/
├── data/
│   ├── health.json
│   ├── owner.json
│   ├── pet.json
│   └── site.json
└── images/
    ├── example-profile.jpg
    ├── example-photo-1.jpeg
    ├── example-photo-2.png
    └── example-photo-3.svg
```

For supplying your own [pre-built site](#production-build) in the lean deployment, supply the `dist` directory as is.

## Source data

> [!NOTE]  
> All date attributes require the `DD-MM-YYYY` format (i.e. `"15-01-2020"`).

### site.json

Site metadata and branding:

```json
{
  "name": "Mocha's Profile",
  "shortname": "Mocha",
  "description": "Meet Mocha - A beloved cat companion",
  "theme_colour": "#1a1a1a",
  "language": "en",
  "url": "https://mocha.example.com",
  "font": {
    "family": "Inter",
    "weights": "400;500;600;700"
  }
}
```

| Field | Required | Description |
|-------|----------|-------------|
| `name` | true | Full site title |
| `shortname` | false | Short name for PWA |
| `description` | true | Site description for SEO |
| `theme_colour` | false | Theme colour for browser chrome |
| `language` | false | Language code (default: `en`) |
| `url` | false | Canonical URL |
| `font.family` | false | Google Font family name |
| `font.weights` | false | Font weights to load |

### pet.json

Pet profile information:

```json
{
  "name": "Mocha",
  "dob": "15-01-2020",
  "breed": "Classic Siamese",
  "colour": "Seal Points",
  "gender": "Male",
  "neutered": true,
  "insured": false,
  "microchipId": "123456789012345",
  "photos": [
    {
      "src": "hero.jpg",
      "alt": "Mocha the cat",
      "featured": true
    }
  ],
  "about": {
    "personality": "Gentle and curious...",
    "favourites": {
      "food": ["Salmon wet food", "Occasional treats"],
      "toy": ["Feather wand", "Crinkle balls"],
      "sleepSpot": "The sunny spot by the window or on a warm laptop"
    },
    "quirks": ["Chirps at birds", "Loves to knock things off tables"]
  },
  "routine": {
    "wakeUp": "6:00 AM - Morning stretches",
    "breakfast": "7:00 AM - Wet food and fresh water"
  },
  "socials": [
    {
      "name": "Pixelfed",
      "url": "https://pixelfed.social"
    }
  ]
}
```

| Field | Required | Description |
|-------|----------|-------------|
| `name` | true | Pet name |
| `dob` | false | Date of birth (i.e. `DD-MM-YYYY`) |
| `breed` | true | Breed |
| `colour` | true | Coat colour/pattern |
| `gender` | false | Gender |
| `neutered` | false | Whether the pet has been neutered or spayed (i.e. `true` or `false`) |
| `insured` | false | Whether the pet is insured (i.e. `true` or `false`) |
| `microchipId` | false | Microchip ID number |
| `photos` | false | Array of photo objects |
| `photos[].src` | true | Filename (relative to `/path/to/images` directory) |
| `photos[].alt` | true | Alt text for accessibility |
| `photos[].featured` | false | Set `true` for hero image (i.e. profile picture) |
| `about` | false | About section object |
| `about.personality` | false | Personality description |
| `about.favourites` | false | Categories of favourites as keys and either string or array of favourite items as values |
| `about.quirks` | false | Array of quirky behaviours |
| `routine` | false | Daily routine (key-value pairs) |
| `socials` | false | Array of social links |

### health.json

Health records including vaccinations, vet visits, weight records, conditions, medications, and allergies:

```json
{
  "vaccinations": [
    {
      "name": "FVRCP",
      "date": "15-06-2023",
      "nextDue": "15-06-2026",
      "veterinarian": "Dr. Smith",
      "clinic": "Happy Paws Clinic",
      "notes": "3-year vaccine"
    }
  ],
  "vetVisits": [
    {
      "date": "10-01-2024",
      "reason": "Annual wellness exam",
      "notes": "Healthy weight at 4.5kg",
      "veterinarian": "Dr. Smith",
      "clinic": "Happy Paws Clinic"
    }
  ],
  "weight": [
    { "date": "10-01-2024", "kg": 4.5 }
  ],
  "conditions": [
    {
      "name": "Mild arthritis",
      "diagnosedDate": "10-01-2024",
      "status": "managed",
      "notes": "Age-related"
    }
  ],
  "medications": [
    {
      "name": "Glucosamine supplement",
      "dosage": "1 chew daily",
      "frequency": "Daily with food",
      "startDate": "15-01-2024",
      "reason": "Joint health support"
    }
  ],
  "allergies": [
    {
      "allergen": "Chicken",
      "severity": "mild",
      "reaction": "Skin irritation",
      "notes": "Avoid chicken-based foods"
    }
  ]
}
```

Vaccination status (automatically calculated based on `nextDue`):

| Status | Condition | Colour |
|--------|-----------|--------|
| Current | More than 30 days until due | Green |
| Due Soon | 30 days or less until due | Yellow |
| Overdue | Past due date | Red |
| Unknown | Missing or invalid date | Grey |

Condition status:

| Status | Description | Colour |
|--------|-------------|--------|
| `managed` | Under control | Green |
| `monitoring` | Being watched | Yellow |
| `active` | Currently being treated | Red |

Allergy severity:

| Severity | Description | Colour |
|----------|-------------|--------|
| `mild` | Low concern | Green |
| `moderate` | Caution advised | Yellow |
| `severe` | Serious concern | Red |

### owner.json

Owner and emergency contact information:

```json
{
  "name": "Your Name",
  "phone": "+60 12-345 6789",
  "email": "owner@example.com",
  "address": "123 Cat Street, Meowville",
  "notes": "Available for contact through iMessage",
  "socials": [
    {
      "name": "Mastodon",
      "url": "https://mastodon.social"
    }
  ],
  "emergencyContact": {
    "name": "Emergency Contact",
    "phone": "+60 19-876 5432",
    "relationship": "Family Friend"
  }
}
```

| Field | Required | Description |
|-------|----------|-------------|
| `name` | true | Owner's name |
| `phone` | false | Phone number |
| `email` | false | Email address |
| `address` | false | Physical address |
| `notes` | false | Additional notes or information about the owner |
| `socials` | false | Array of social links |
| `emergencyContact` | false | Emergency contact object |
| `emergencyContact.name` | true | Contact name |
| `emergencyContact.phone` | false | Contact phone |
| `emergencyContact.relationship` | false | Relationship to owner |

## Adding photos

> [!NOTE]  
> Apple's `HEIC` image format is currently unsupported outside of Safari and needs to be converted to more common image formats beforehand.

1. Add your photos to `src/assets/images/` (or your own `/path/to/images/` for Docker).

2. Update `pet.json` with photo information:

    ```json
    {
      "photos": [
        {
          "src": "my-cat-hero.jpg",
          "alt": "My cat looking majestic",
          "featured": true
        },
        {
          "src": "my-cat-sleeping.jpg",
          "alt": "My cat napping",
          "featured": false
        }
      ]
    }
    ```

    The first photo attributed as `featured: true` appears in the hero section (i.e. profile picture). All other photos, if any, appear in the gallery section.

## Licence

AGPL-3.0-or-later
