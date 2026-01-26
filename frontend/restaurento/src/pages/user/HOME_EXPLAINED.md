# Home.jsx - Line by Line Explanation

This document explains every part of the `Home.jsx` component. This file uses **Virtualization** (loading only what you see) to handle thousands of restaurants without slowing down.

## 1. Imports (Lines 1-11)

```javascript
import React, { useState, useEffect, useRef, useMemo } from "react";
// ... icons from lucide-react ...
import { useForm } from "react-hook-form";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useVirtualizer } from "@tanstack/react-virtual";
import userService from "../../services/user.service";
```

*   **`useRef`**: Used to get a reference to the scrolling div so we can measure how far you have scrolled.
*   **`useMemo`**: Cache variable results so we don't recalculate complex math on every render.
*   **`useForm`**: Manages the Search input field easily.
*   **`useInfiniteQuery`**: The engine that fetches data. It handles "Fetch Page 1", then "Fetch Page 2", and caches the results.
*   **`useVirtualizer`**: The "magician." It calculates exactly which 5 rows should be on specific pixels on your screen right now.

---

## 2. Image Fallback (Lines 13-14)

```javascript
const FALLBACK_IMAGE = "https://images...";
```

*   A default image URL used if a restaurant does not have any images uploaded. It prevents broken image icons.

---

## 3. RestaurantCard Component (Lines 16-77)

```javascript
const RestaurantCard = React.memo(({ item }) => { ... });
```

*   **`React.memo(...)`**: This is a performance shield. It says: "If the `item` (restaurant data) hasn't changed, DO NOT re-render this card." This is crucial for smooth typing in the search bar.
*   **`const [imageLoaded, setImageLoaded] = useState(false)`**: Tracks if the image has finished downloading. Initially `false`.
*   **`getOptimizedImageUrl`**: A helper function. If the image is from Unsplash, it adds `&w=500` to the URL. This asks the server for a small 500px wide image instead of a huge 4000px original. Save bandwidth!
*   **`onLoad={() => setImageLoaded(true)}`**: When the `<img>` tag successfully loads the data, this triggers.
*   **ClassName Logic**:
    *   `opacity-0 scale-95`: Start invisible and slightly shrunk.
    *   `opacity-100 scale-100`: When loaded, fade in and scale up. This creates the smooth "pop" effect.

---

## 4. Main Home Component State (Lines 100-111)

```javascript
const Home = () => {
  const { register, handleSubmit } = useForm();
  const [columns, setColumns] = useState(3);
  const parentRef = useRef(null);
```

*   **`columns`**: Stores how many cards fit in one row (1 for mobile, 3 for desktop).
*   **`parentRef`**: This variable will be attached to the main `<div>` that scrolls. The Virtualizer needs this to read the `scrollTop` (scroll position).

---

## 5. Responsive Column Logic (Lines 113-122)

```javascript
useEffect(() => {
  const handleResize = () => {
    if (window.innerWidth < 640) setColumns(1);
    // ...
  };
  // Listen for window resize
}, []);
```

*   This code runs once when the component mounts.
*   It adds a listener to the window. If the user resizes their browser, it updates `setColumns`.

---

## 6. Data Fetching (Lines 131-152)

```javascript
const { data, fetchNextPage, ... } = useInfiniteQuery({
    queryKey: ["restaurants", searchQuery],
    queryFn: async ({ pageParam = 1 }) => { ... }
});
```

*   **`queryKey`**: The unique ID for this data. Notice `searchQuery` is inside. This means whenever `searchQuery` changes, React Query automagically throws away old data and refetches new data matching the search.
*   **`queryFn`**: The function that actually calls the API (`userService.getDashboard`).
*   **`pageParam`**: Starts at 1. When we scroll to the bottom, we call `fetchNextPage()`, which increments this to 2, 3, etc.

---

## 7. Data Flattening (Lines 154-157)

```javascript
const allRestaurants = useMemo(
  () => (data ? data.pages.flatMap((p) => p.results) : []),
  [data]
);
```

*   The API returns "Pages" of data `[{results: [a,b]}, {results: [c,d]}]`.
*   `flatMap` turns this into one simple list: `[a, b, c, d]`. Easy to map over!

---

## 8. Organizing Rows (Lines 164-177)

**CRITICAL PART**: Virtualizers work with **Rows**, but we want a **Grid** (3 items per row).

```javascript
const rows = useMemo(() => {
    const r = ["HEADER"]; // Row 0 is always the Header
    // ...
    for (let i = 0; i < allRestaurants.length; i += columns) {
        // Grab 3 items and bundle them into ONE row
        r.push(allRestaurants.slice(i, i + columns));
    }
    return r;
}, ...);
```

*   We manually chunk the list.
*   If we have 10 restaurants and 3 columns:
    *   Row 0: "HEADER"
    *   Row 1: [Rest1, Rest2, Rest3]
    *   Row 2: [Rest4, Rest5, Rest6]
    *   Row 3: [Rest7, Rest8, Rest9]
    *   Row 4: [Rest10]

---

## 9. The Virtualizer (Lines 179-184)

```javascript
const rowVirtualizer = useVirtualizer({
    estimateSize: (index) => (index === 0 ? 650 : 380),
    // ...
});
```

*   This creates the logic engine.
*   **`estimateSize`**:
    *   If `index === 0` (The Header Row), assume it is **650px** tall.
    *   For all other rows (Restaurant Cards), assume they are **380px** tall.
*   This math allows the scrollbar to work correctly even though we haven't rendered the rows yet.

---

## 10. Infinite Scroll Trigger (Lines 191-201)

```javascript
useEffect(() => {
    if (lastRowIndex >= rows.length - 1 && hasNextPage) {
        fetchNextPage();
    }
}, [lastRowIndex...]);
```

*   This effectively says: "If the user has scrolled to the very last row we know about... QUICK! Call the API and get more data!"

---

## 11. Rendering (Lines 223+)

We render a huge `div` with a specific height, but only fill it with the few items currently in view.

```javascript
{virtualRows.map((virtualRow) => {
    // 1. Calculate absolute position
    const style = {
        position: "absolute",
        transform: `translateY(${virtualRow.start}px)`, // MAGIC!
        // Places this row exactly at pixel 500, or 2000, etc.
    };

    // 2. Decide WHAT to render
    if (rowType === "HEADER") return <Header ... />
    if (rowType === "SKELETON") return <Skeleton ... />
    
    // 3. Render Data Row
    return (
        <div style={style}>
            <div className="grid...">
                {rowItems.map(item => <RestaurantCard item={item}/>)}
            </div>
        </div>
    )
})}
```

*   We use CSS `transform: translateY(...)` to place rows.
*   Normally, HTML elements stack one after another.
*   Here, we force them to precise pixel coordinates calculated by the Virtualizer. This allows us to have "Row 100" exist at `38,000px` down the page without needing Rows 1-99 to exist in the DOM.

