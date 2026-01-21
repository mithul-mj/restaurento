export const getImageUrl = (img) => {
    if (!img) return null;
    if (typeof img === "string") return img;
    if (img.preview) return img.preview;
    if (Array.isArray(img) && img.length > 0) {
        const first = img[0];
        if (typeof first === "string") return first;
        if (first.preview) return first.preview;
    }
    return null;
};
