import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { router } from "expo-router";
import HomeTopBar from "../HomeTopBar";
import Banner from "../Banner";
import ProductSearchFilter from "../ProductSearchFilter";
import CategorySelector from "../CategorySelector";
import type { Category } from "../../types/category";

interface HomeHeaderProps {
  cartCount: number;
  categories: Category[];
  selectedCategoryId: string | null;
  selectedCategoryName?: string;
  showCategories: boolean;
  searchQuery: string;
  minPrice: string;
  maxPrice: string;
  isPriceRangeInvalid: boolean;
  resultCount: number;
  onSearchChange: (val: string) => void;
  onMinPriceChange: (val: string) => void;
  onMaxPriceChange: (val: string) => void;
  onClearFilters: () => void;
  onToggleCategories: (show: boolean) => void;
  onSelectCategory: (id: string | null) => void;
}

export default function HomeHeader({
  cartCount,
  categories,
  selectedCategoryId,
  selectedCategoryName,
  showCategories,
  searchQuery,
  minPrice,
  maxPrice,
  isPriceRangeInvalid,
  resultCount,
  onSearchChange,
  onMinPriceChange,
  onMaxPriceChange,
  onClearFilters,
  onToggleCategories,
  onSelectCategory,
}: HomeHeaderProps) {
  return (
    <View>
      <HomeTopBar cartCount={cartCount} />
      <Banner />

      {/* Nút xem lịch sử đơn hàng */}
      <Pressable
        onPress={() => router.push("/orders")}
        style={styles.navButton}
      >
        <Text style={styles.navButtonText}>📦 Lịch sử đơn hàng</Text>
      </Pressable>

      {/* Nút xem thông tin tài khoản */}
      <Pressable
        onPress={() => router.push("/profile")}
        style={styles.navButton}
      >
        <Text style={styles.navButtonText}>👤 Thông tin tài khoản</Text>
      </Pressable>

      {/* Bộ lọc tìm kiếm và giá */}
      <ProductSearchFilter
        searchQuery={searchQuery}
        minPrice={minPrice}
        maxPrice={maxPrice}
        priceRangeError={isPriceRangeInvalid}
        onSearchChange={onSearchChange}
        onMinPriceChange={onMinPriceChange}
        onMaxPriceChange={onMaxPriceChange}
        onClear={onClearFilters}
      />

      {/* Menu điều hướng Home / Danh mục */}
      <View style={styles.menu}>
        <Pressable
          style={[styles.menuItem, !showCategories && styles.activeMenu]}
          onPress={() => {
            onToggleCategories(false);
            onSelectCategory(null);
          }}
        >
          <Text style={[styles.menuText, !showCategories && styles.activeMenuText]}>
            Home
          </Text>
        </Pressable>

        <Pressable
          style={[styles.menuItem, showCategories && styles.activeMenu]}
          onPress={() => {
            onToggleCategories(true);
            onSelectCategory(null);
          }}
        >
          <Text style={[styles.menuText, showCategories && styles.activeMenuText]}>
            Danh mục sản phẩm
          </Text>
        </Pressable>
      </View>

      {/* Khu vực danh mục */}
      {showCategories && (
        <View>
          <Text style={styles.sectionTitle}>Chọn danh mục</Text>
          <CategorySelector
            categories={categories}
            selectedCategoryId={selectedCategoryId}
            onSelect={onSelectCategory}
          />
        </View>
      )}

      {/* Tiêu đề danh sách sản phẩm */}
      <Text style={styles.sectionTitle}>
        {selectedCategoryId ? selectedCategoryName || "Sản phẩm" : "Tất cả sản phẩm"}{" "}
        ({resultCount})
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  navButton: {
    backgroundColor: "#FFFFFF",
    padding: 13,
    borderRadius: 9,
    alignItems: "center",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#338DA3",
  },
  navButtonText: {
    color: "#338DA3",
    fontWeight: "bold",
    fontSize: 15,
  },
  menu: {
    flexDirection: "row",
    gap: 10,
    marginTop: 18,
    marginBottom: 18,
  },
  menuItem: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#EEEEEE",
  },
  activeMenu: {
    backgroundColor: "#338DA3",
  },
  menuText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#555555",
  },
  activeMenuText: {
    color: "#FFFFFF",
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: "bold",
    marginTop: 12,
    marginBottom: 14,
    color: "#333333",
  },
});
