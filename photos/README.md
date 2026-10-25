# Photos

Put original photos here (any size, straight from the camera or phone). The file name decides where each photo appears; see "Photos" in `../CONTENT-CHECKLIST.md`.

`npm run build` (or `npm run images`) turns them into small AVIF/WebP files in `public/images/`, fixes rotation and removes all metadata, including GPS location. A slot with no photo shows a visible placeholder.

Names: lowercase letters, digits and hyphens only, e.g. `hero.jpg`, `service-road-works-1.jpg`, `project-sample-house-1.jpg`.
