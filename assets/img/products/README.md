# Product photography

Drop product photos in this folder, then reference them from the product's
`images` array in `assets/js/data.js`.

## How it works

Each product renders a real photo when it has an `images` array, and falls back
to the generated SVG artwork when it doesn't. So you can swap products over to
real photography one at a time.

1. Add your image files here, e.g.:

   ```
   assets/img/products/ridgeway-jacket-green.jpg
   assets/img/products/ridgeway-jacket-peat.jpg
   assets/img/products/ridgeway-jacket-slate.jpg
   ```

2. In `assets/js/data.js`, find the product and add an `images` array. List one
   image per colour, in the **same order** as that product's `colorNames`, so the
   colour swatches switch to the matching photo:

   ```js
   P({ name: "Ridgeway Waxed Work Jacket", maker: "Fenwick & Sons",
       collection: "graft", category: "Clothing", icon: "jacket", price: 129,
       colorNames: ["Fell Green", "Peat", "Slate"],
       images: [
         "assets/img/products/ridgeway-jacket-green.jpg",
         "assets/img/products/ridgeway-jacket-peat.jpg",
         "assets/img/products/ridgeway-jacket-slate.jpg"
       ],
       ... }),
   ```

   You can list just one image if you only have one — every view will use it.

## Image guidance (from the brand)

- **Shape:** portrait, **4:5** (e.g. 1000×1250px). The frames are square-edged.
- **Background:** product shots on **wool-white (#FFFFFF)** or natural textures
  (wood, wool, stone).
- **Format:** JPG or WebP for photos; keep each file well under ~500KB.
- Use lowercase, hyphenated filenames.

The product thumbnails and the gallery both read from the same `images` list.
