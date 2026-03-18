import multer from "multer";
import { storage } from "../../config/cloudinary.config.js";
import { Restaurant } from "../../models/Restaurant.model.js";
import { Schedule } from "../../models/Schedule.model.js";
import { sendEmail } from "../../services/commonAuth.service.js";
import { getPreApprovalEmailTemplate } from "../../utils/emailTemplates.js";
import { timeToMinutes } from "../../utils/timeUtils.js";
import STATUS_CODES from "../../constants/statusCodes.js";

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
    let openingHours = typeof body.openingHours === 'string' ? JSON.parse(body.openingHours) : body.openingHours;

    if (openingHours && openingHours.days) {
      openingHours.days = openingHours.days.map((day) => ({
        ...day,
        startTime: typeof day.startTime === 'string' ? timeToMinutes(day.startTime) : day.startTime,
        endTime: typeof day.endTime === 'string' ? timeToMinutes(day.endTime) : day.endTime,
      }));
    }
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
      tags: tags,
      menuItems,
      images: galleryUrls,
      isOnboardingCompleted: true,
    };

    const scheduleData = {
      openingHours,
      slotConfig,
      totalSeats: Number(body.totalSeats),
      slotPrice: Number(body.slotPrice),
    };

    const existingRestaurant = await Restaurant.findById(user._id);

    if (!existingRestaurant) {
      return res.status(STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    if (existingRestaurant.verificationStatus === "pending") {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: "Application is under review. You cannot edit details while pending approval.",
      });
    }

    const updatedRestaurant = await Restaurant.findByIdAndUpdate(
      user._id,
      {
        $set: {
          ...restaurantData,
        },
      },
      { new: true }
    );

    // Initial schedule entry starting from today midnight
    const startDate = new Date();
    startDate.setUTCHours(0, 0, 0, 0);

    await Schedule.create({
      restaurantId: user._id,
      validFrom: startDate,
      ...scheduleData,
    });

    console.log("=== Onboarding Debug ===");
    console.log("Tags:", tags);
    console.log("Menu Items:", menuItems.length);
    console.log("Images:", galleryUrls.length);
    console.log("========================");

    if (!updatedRestaurant) {
      return res.status(STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    res.status(STATUS_CODES.CREATED).json({
      message: "Onboarding details submitted successfully",
      restaurantId: updatedRestaurant._id,
    });
  } catch (error) {
    console.error("Backend onboarding error:", error);
    res
      .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal server error during onboarding" });
  }
};
