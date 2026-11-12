
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
} from "react-native";

interface ProductSearchFilterProps {
  searchQuery: string;
  minPrice: string;
  maxPrice: string;
  priceRangeError: boolean;
  onSearchChange: (value: string) => void;
  onMinPriceChange: (value: string) => void;
  onMaxPriceChange: (value: string) => void;
  onClear: () => void;
}

export default function ProductSearchFilter({
  searchQuery,
  minPrice,
  maxPrice,
  priceRangeError,
  onSearchChange,
  onMinPriceChange,
  onMaxPriceChange,
  onClear,
}: ProductSearchFilterProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tìm kiếm sản phẩm</Text>

      <TextInput
        style={styles.searchInput}
        value={searchQuery}
        onChangeText={onSearchChange}
        placeholder="Nhập tên hoặc danh mục sản phẩm..."
      />

      <Text style={styles.title}>Lọc theo khoảng giá</Text>

      <View style={styles.priceRow}>
        <TextInput
          style={styles.priceInput}
          value={minPrice}
          onChangeText={onMinPriceChange}
          keyboardType="numeric"
          placeholder="Giá thấp nhất"
        />

        <Text style={styles.separator}>-</Text>

        <TextInput
          style={styles.priceInput}
          value={maxPrice}
          onChangeText={onMaxPriceChange}
          keyboardType="numeric"
          placeholder="Giá cao nhất"
        />
      </View>

      {priceRangeError && (
        <Text style={styles.errorText}>
          Giá thấp nhất không được lớn hơn giá cao nhất.
        </Text>
      )}

      <Pressable onPress={onClear} style={styles.clearButton}>
        <Text style={styles.clearText}>Xóa bộ lọc</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    padding: 14,
    marginVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  title: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 8,
  },
  searchInput: {
    height: 44,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    fontSize: 14,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  priceInput: {
    flex: 1,
    height: 42,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 13,
  },
  separator: {
    marginHorizontal: 8,
    color: "#666666",
  },
  errorText: {
    color: "#DC2626",
    fontSize: 12,
    marginTop: 8,
  },
  clearButton: {
    alignSelf: "flex-end",
    marginTop: 12,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  clearText: {
    color: "#338DA3",
    fontWeight: "bold",
    fontSize: 13,
  },
});
