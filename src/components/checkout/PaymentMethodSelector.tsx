import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import type { PaymentMethod } from "../../types/order";

interface PaymentMethodSelectorProps {
  selectedMethod: PaymentMethod;
  onSelectMethod: (method: PaymentMethod) => void;
}

export default function PaymentMethodSelector({
  selectedMethod,
  onSelectMethod,
}: PaymentMethodSelectorProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>3. Phương thức thanh toán</Text>

      {/* Phương thức 1: COD */}
      <Pressable
        style={[
          styles.paymentOption,
          selectedMethod === "COD" && styles.paymentOptionSelected,
        ]}
        onPress={() => onSelectMethod("COD")}
      >
        <Text style={styles.paymentIcon}>💵</Text>
        <View style={styles.paymentContent}>
          <Text style={styles.paymentTitle}>
            Thanh toán khi nhận hàng (COD)
          </Text>
          <Text style={styles.paymentDescription}>
            Bạn thanh toán trực tiếp khi nhận được sản phẩm.
          </Text>
        </View>
        <View
          style={[
            styles.radioCircle,
            selectedMethod === "COD" && styles.radioCircleSelected,
          ]}
        >
          {selectedMethod === "COD" ? <View style={styles.radioDot} /> : null}
        </View>
      </Pressable>

      {/* Phương thức 2: Chuyển khoản ngân hàng */}
      <Pressable
        style={[
          styles.paymentOption,
          { marginTop: 10 },
          selectedMethod === "BANK_TRANSFER" && styles.paymentOptionSelected,
        ]}
        onPress={() => onSelectMethod("BANK_TRANSFER")}
      >
        <Text style={styles.paymentIcon}>🏦</Text>
        <View style={styles.paymentContent}>
          <Text style={styles.paymentTitle}>
            Chuyển khoản ngân hàng
          </Text>
          <Text style={styles.paymentDescription}>
            Mô phỏng: Admin sẽ xác nhận sau khi nhận được chuyển khoản.
          </Text>
        </View>
        <View
          style={[
            styles.radioCircle,
            selectedMethod === "BANK_TRANSFER" && styles.radioCircleSelected,
          ]}
        >
          {selectedMethod === "BANK_TRANSFER" ? (
            <View style={styles.radioDot} />
          ) : null}
        </View>
      </Pressable>

      {/* Ghi chú mô phỏng khi chọn chuyển khoản ngân hàng */}
      {selectedMethod === "BANK_TRANSFER" && (
        <View style={styles.simulationNoteBox}>
          <Text style={styles.simulationNoteTitle}>📌 Hướng dẫn chuyển khoản (Mô phỏng)</Text>
          <Text style={styles.simulationNoteText}>
            Đây là phiên bản mô phỏng thanh toán thủ công trong phạm vi bài tập. Sau khi đặt hàng thành công, đơn hàng sẽ ở trạng thái "Chờ xác nhận thanh toán". Quản trị viên (Admin) sẽ kiểm tra và xác nhận đã nhận tiền trên hệ thống.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  sectionTitle: {
    color: "#333333",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 14,
  },
  paymentOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 9,
    backgroundColor: "#FAFAFA",
  },
  paymentOptionSelected: {
    borderColor: "#338DA3",
    backgroundColor: "#F0F8FA",
  },
  paymentIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  paymentContent: {
    flex: 1,
  },
  paymentTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#333333",
  },
  paymentDescription: {
    fontSize: 11,
    color: "#777777",
    marginTop: 3,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  radioCircleSelected: {
    borderColor: "#338DA3",
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#338DA3",
  },
  simulationNoteBox: {
    marginTop: 12,
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#FFFBEB",
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  simulationNoteTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#92400E",
    marginBottom: 4,
  },
  simulationNoteText: {
    fontSize: 11,
    color: "#78350F",
    lineHeight: 16,
  },
});
