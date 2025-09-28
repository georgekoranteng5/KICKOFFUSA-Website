# Gallery System Documentation

## Overview
The KickoffUSA gallery system automatically displays photos and videos from the `assets/gallery/` folder. No user uploads are allowed - media is managed by adding files directly to the folder.

## How to Add Media

### 1. Organize Files by Event
Create event folders within `assets/gallery/` and place your media files inside:

```
assets/
  gallery/
    CHAMPION SOUND/
      IMG_6163.jpeg
      IMG_6162.jpeg
      IMG_6186.jpeg
      ...
    KICKOFF CUP/
      IMG_3830.JPG
      IMG_3831.JPG
      DSCN0336.JPG
      ...
    SUMMER SERIES/
      AO4I9928.jpg
      AO4I9452.jpg
      AO4I9247.jpg
      ...
```

### 2. Supported File Types
- **Images**: `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`
- **Videos**: `.mp4`, `.mov`, `.avi`, `.webm`

### 3. Event Organization
The system uses folder names as event names:

- `CHAMPION SOUND/` → Event: "CHAMPION SOUND"
- `KICKOFF CUP/` → Event: "KICKOFF CUP"  
- `SUMMER SERIES/` → Event: "SUMMER SERIES"

### 4. File Naming Within Events
- Use descriptive names for individual photos
- The system will create readable titles from filenames
- Examples:
  - `IMG_6163.jpeg` → Title: "Img 6163"
  - `AO4I9928.jpg` → Title: "Ao4i9928"
  - `DSCN0336.JPG` → Title: "Dscn0336"

## Gallery Features

### Automatic Organization
- Files are automatically sorted by creation date (newest first)
- Event names are extracted from filenames
- Filter buttons are automatically generated based on available events

### Responsive Display
- Grid layout that adapts to different screen sizes
- Hover effects and smooth transitions
- Video play icons for video files
- Lazy loading for better performance

### Event Filtering
- "All Events" button shows all media
- Individual event buttons filter by specific events
- Filter buttons are automatically generated from your file names

## Technical Details

### Backend API
- `GET /api/gallery` - Returns all gallery items with metadata
- Automatically scans the `assets/gallery/` folder
- Extracts file metadata (size, type, creation date)
- Generates event names and titles from filenames

### Frontend
- Fetches gallery data from the API
- Displays media in a responsive grid
- Provides filtering functionality
- Handles both images and videos

## File Structure
```
KICKOFFUSA/
  assets/
    gallery/           # Add your media files here
      *.jpg
      *.png
      *.mp4
      *.mov
      ...
  index.html          # Gallery section in HTML
  server.js           # Gallery API endpoints
```

## Adding New Media
1. Take photos/videos at your events
2. Name them descriptively (e.g., `event-name-description.jpg`)
3. Place them in the `assets/gallery/` folder
4. The gallery will automatically update when the page is refreshed

No database setup or file uploads required - just drop files in the folder and they'll appear in the gallery!
