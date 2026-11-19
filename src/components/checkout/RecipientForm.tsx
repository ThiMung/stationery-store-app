import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";

interface RecipientFormProps {
  recipientName: string;
  setRecipientName: (val: string) => void;
  phone: string;
  setPhone: (val: string) => void;
  address: string;
  setAddress: (val: string) => void;
}

export default function RecipientForm({
  recipientName,
  setRecipientName,
  phone,
  setPhone,
  address,
  setAddress,
}: RecipientFormProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>1. Thông tin nhận hàng</Text>

      <Text style={styles.inputLabel}>Họ và tên người nhận *</Text>
      <TextInput
        style={styles.input}
        value={recipientName}
        onChangeText={setRecipientName}
        placeholder="Nhập họ tên người nhận"
        maxLength={100}
      />

      <Text style={styles.inputLabel}>Số điện thoại *</Text>
      <TextInput
        style={styles.input}
        value={phone}
        onChangeText={setPhone}
        placeholder="Nhập số điện thoại"
        keyboardType="phone-pad"
      />

      <Text style={styles.inputLabel}>Địa chỉ nhận hàng *</Text>
      <TextInput
        style={[styles.input, styles.addressInput]}
        value={address}
        onChangeText={setAddress}
        placeholder="Nhập địa chỉ nhận hàng"
        multiline
        maxLength={250}
      />
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
  inputLabel: {
    color: "#555555",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 7,
    marginTop: 12,
  },
  input: {
    minHeight: 44,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    color: "#333333",
  },
  addressInput: {
    minHeight: 85,
    textAlignVertical: "top",
    paddingTop: 10,
  },
});
