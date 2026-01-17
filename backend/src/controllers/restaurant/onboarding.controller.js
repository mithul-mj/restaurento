import multer from "multer";
import { storage } from "../../config/cloudinary.config.js";
import { Restaurant } from "../../models/Restaurant.model.js";
export const upload = multer({ storage });

export const onboardingUploads = upload.fields([
  { name: "images", maxCount: 10 },
  ...Array.from({ length: 20 }, (_, i) => ({
    name: `menuItems[${i}].image`,
    maxCount: 1,
  })),
]);

export const preApprovalUploads = upload.fields([
  { name: "restaurantLicense", maxCount: 1 },
  { name: "businessCert", maxCount: 1 },
  { name: "fssaiCert", maxCount: 1 },
  { name: "ownerIdCert", maxCount: 1 },
]);

export const submitOnboarding = async (req, res, next) => {
  try {
    const { body, files, user } = req;

    console.log("Raw openingHours from frontend:", body.openingHours);

    const slotConfig = typeof body.slotConfig === 'string' ? JSON.parse(body.slotConfig) : body.slotConfig;
    const openingHours = typeof body.openingHours === 'string' ? JSON.parse(body.openingHours) : body.openingHours;
    const galleryUrls = files["images"]?.map((f) => f.path) || [];

    const menuItems = [];
    let i = 0;
    while (body[`menuItems[${i}].name`]) {
      menuItems.push({
        name: body[`menuItems[${i}].name`],
        price: Number(body[`menuItems[${i}].price`]),
        description: body[`menuItems[${i}].description`] || "",
        categories: Object.keys(body)
          .filter((key) => key.startsWith(`menuItems[${i}].categories[`))
          .map((key) => body[key]),
        image: files[`menuItems[${i}].image`]?.[0]?.path || null,
      });
      i++;
    }

    let tags = [];
    if (body.tags) {
      // Case 1: body.tags is already an array or a single value
      if (Array.isArray(body.tags)) {
        tags = body.tags;
      } else {
        // Case 2: body.tags might be '["Italian", "Pizza"]' string
        try {
          const parsed = JSON.parse(body.tags);
          if (Array.isArray(parsed)) tags = parsed;
          else tags = [body.tags];
        } catch (e) {
          tags = [body.tags];
        }
      }
    } else {
      // Case 3: tags[0], tags[1] format
      tags = Object.keys(body)
        .filter((key) => key.startsWith("tags["))
        .map((key) => body[key])
        .flat();
    }

    const restaurantData = {
      description: body.description,
      totalSeats: Number(body.totalSeats),
      slotPrice: Number(body.slotPrice),
      tags: tags,
      openingHours,
      slotConfig,
      menuItems,
      images: galleryUrls,
      isOnboardingCompleted: true,
    };




    const updatedRestaurant = await Restaurant.findByIdAndUpdate(
      user._id,
      restaurantData,
      { new: true }
    );

    console.log("=== DEBUG INFO ===");
    console.log("Tags received:", tags);
    console.log("Menu items parsed:", menuItems);
    console.log("Images received:", galleryUrls);
    console.log("Opening Hours:", JSON.stringify(openingHours, null, 2));
    console.log("Slot Config:", slotConfig);
    console.log("==================");

    if (!updatedRestaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    res.status(201).json({
      message: "Onboarding details submitted successfully",
      restaurantId: "generated_id_here",
    });
  } catch (error) {
    console.error("Backend onboarding error:", error);
    res
      .status(500)
      .json({ message: "Internal server error during onboarding" });
  }
};
