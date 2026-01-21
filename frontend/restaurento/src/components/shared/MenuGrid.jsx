import React from "react";
import { ChefHat } from "lucide-react";
import { getImageUrl } from "../../utils/imageUtils";

const MenuGrid = ({ items = [], activeTab, emptyStateMessage }) => {
  if (items.length === 0) {
    return (
      <div className="col-span-full text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
        <ChefHat className="w-8 h-8 text-gray-300 mx-auto mb-2" />
        <p className="text-gray-400 text-sm">
          {emptyStateMessage ||
            (activeTab ? `No items in ${activeTab}` : "No menu items found")}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((item, index) => (
        <div
          key={item.id || index}
          className="bg-white border border-gray-100 rounded-xl p-3 flex gap-4 hover:shadow-lg hover:border-orange-100 transition-all duration-300 group">
          <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
            <img
              src={
                getImageUrl(item.image) ||
                "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200"
              }
              alt={item.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              style={{ minHeight: "6rem", minWidth: "6rem" }}
            />
          </div>
          <div className="flex-1 flex flex-col justify-between py-1">
            <div>
              <h4 className="font-bold text-gray-900 line-clamp-1">
                {item.name}
              </h4>
              <p className="text-xs text-gray-500 line-clamp-2 mt-1">
                {item.description ||
                  item.desc ||
                  "Deeply flavorful dish prepared with fresh ingredients."}
              </p>
            </div>
            <div className="font-bold text-[#ff5e00] text-sm mt-2">
              {typeof item.price === "number" ? `₹${item.price}` : item.price}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MenuGrid;
