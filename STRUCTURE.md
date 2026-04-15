# Project Update - Navbar and Category Restructuring

## Changes Implemented

### 1. Navigation Bar Updates (`Header.tsx`)
- Renamed **LUGGAGE** to **TRAVEL**.
- Added subcategories for **TRAVEL**:
    - LUGGAGE
    - DUFFLE
    - TREKKING
- Added subcategories for **ACCESSORIES**:
    - POUCH
    - LUNCH BAG
    - DAYPACK
    - TOTE BAG
- Renamed **Laptop/Office Backpacks** to **Office Backpacks**.

### 2. Category System Updates (`constants/products.ts`)
- Added new category definitions for all new subcategories.
- Properly nested new categories under their respective parents (Travel and Accessories) for better filtering and organization.
- Ensured slugs match the new navigation links.

### 3. Routing
- Verified that all new category slugs are handled by the dynamic `CategoryPage` route.
