import React, { useState } from "react";
import { showToast, showError, showConfirm } from "../../utils/alert";
import { useForm } from "react-hook-form";
import { Bell, Camera } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import userService from "../../services/user.service";
import authService from "../../services/auth.service";
import { setCredentials } from "../../redux/slices/authSlice";
import EmailChangeModal from "../../components/modals/EmailChangeModal";
import ImageCropper from "../../components/common/ImageCropper";

const EditProfile = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, avatar, role } = useSelector((state) => state.auth);
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  // Cropper State
  const [imageToCrop, setImageToCrop] = useState(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      avatar,
      fullName: user.fullName,
      email: user.email,
    },
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Create a URL for the selected file to show in cropper
      const url = URL.createObjectURL(file);
      setImageToCrop(url);

      // Reset input value so same file can be selected again if cancelled
      e.target.value = '';
    }
  };

  const handleCropComplete = async (croppedDataUrl) => {
    // Convert Data URL to File
    const res = await fetch(croppedDataUrl);
    const blob = await res.blob();
    const file = new File([blob], "profile-avatar.jpg", { type: "image/jpeg" });

    setSelectedImage(file);
    setPreviewUrl(croppedDataUrl);
    setImageToCrop(null);
  };

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      formData.append("fullName", data.fullName);
      formData.append("email", data.email);
      if (selectedImage) formData.append("avatar", selectedImage);

      const response = await userService.updateProfile(formData);
      if (response.success) {
        dispatch(
          setCredentials({
            user: { ...user, fullName: response.user.fullName },
            avatar: response.user.avatar,
            role,
          })
        );
        showToast("Profile updated successfully!", "success");
        navigate("/profile");
      }
    } catch (error) {
      console.error("Update failed", error);
      showError("Update Failed", "Something went wrong");
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfcfc] font-sans">
      {/* Cropper Modal */}
      {imageToCrop && (
        <ImageCropper
          imageSrc={imageToCrop}
          aspect={1} // 1:1 for Profile Picture
          onCropComplete={handleCropComplete}
          onCancel={() => setImageToCrop(null)}
        />
      )}

      <main className="max-w-3xl mx-auto px-4 md:px-8 py-10">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8 text-center md:text-left">
          Edit Profile
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 flex justify-center">
            <div className="relative">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[#fff0e3]">
                <img
                  src={previewUrl || avatar}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
              <input
                type="file"
                id="avatar-upload"
                className="hidden"
                accept="image/*"
                onChange={handleImageChange}
              />
              <label
                htmlFor="avatar-upload"
                className="absolute bottom-0 right-0 p-2 bg-[#ff5e00] text-white rounded-full hover:bg-[#e05200] border-4 border-white transition-colors shadow-sm cursor-pointer">
                <Camera size={18} />
              </label>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-6">
              Basic Information
            </h2>
            <div className="grid grid-cols-1 gap-6 mb-6">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-lg text-sm font-medium text-gray-900 focus:outline-none focus:border-[#ff5e00] focus:bg-white transition-colors"
                  {...register("fullName", { required: "Name is required" })}
                />
                {errors.fullName && (
                  <span className="text-red-500 text-xs">
                    {errors.fullName.message}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Security</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <input
                    type="text"
                    disabled
                    className="w-full px-4 py-3 bg-gray-100 border border-transparent rounded-lg text-sm font-medium text-gray-500 cursor-not-allowed focus:outline-none"
                    {...register("email")}
                  />
                  <button
                    type="button"
                    onClick={() => setIsEmailModalOpen(true)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[#ff5e00] hover:bg-[#fff5eb] p-1.5 rounded-md text-xs font-bold transition-colors">
                    Edit
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    disabled
                    value="********"
                    className="w-full px-4 py-3 bg-gray-100 border border-transparent rounded-lg text-sm font-bold text-gray-500 cursor-not-allowed focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      const result = await showConfirm(
                        "Reset Password?",
                        `We will send a password reset link to ${user.email}`,
                        "Yes, Send Link"
                      );
                      if (result.isConfirmed) {
                        try {
                          await authService.forgotPassword({
                            email: user.email,
                            role: user.role || "USER",
                          });
                          showToast("Reset Link Sent", "success");
                        } catch (error) {
                          showError(
                            "Error",
                            error.response?.data?.message ||
                            "Failed to send reset link"
                          );
                        }
                      }
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[#ff5e00] hover:bg-[#fff5eb] p-1.5 rounded-md text-xs font-bold transition-colors">
                    Change
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 bg-gray-300 hover:bg-[#ff5e00] text-gray-700 hover:text-white font-bold rounded-lg transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed">
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </main>

      <EmailChangeModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        currentEmail={user.email}
        onEmailUpdated={(newEmail) => {
          setValue("email", newEmail);
          dispatch(setCredentials({
            user: { ...user, email: newEmail },
            avatar,
            role
          }));
        }}
      />
    </div>
  );
};

export default EditProfile;
