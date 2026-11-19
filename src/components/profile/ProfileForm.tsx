import React from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  StyleSheet,
} from "react-native";

interface ProfileFormProps {
  email: string;
  fullName: string;
  setFullName: (val: string) => void;
  phone: string;
  setPhone: (val: string) => void;
  address: string;
  setAddress: (val: string) => void;
  saving: boolean;
  loggingOut: boolean;
  onSave: () => void;
  onLogout: () => void;
}

export default function ProfileForm({
  email,
  fullName,
  setFullName,
  phone,
  setPhone,
  address,
  setAddress,
  saving,
  loggingOut,
  onSave,
  onLogout,
}: ProfileFormProps) {
  return (
    <View style={styles.form}>
      <Text style={styles.label}>Email</Text>
      <TextInput
        style={[styles.input, styles.disabledInput]}
        value={email}
        editable={false}
      />
      <Text style={styles.note}>
        Email được sử dụng để đăng nhập và không thể thay đổi tại đây.
      </Text>

      <Text style={styles.label}>Họ và tên *</Text>
      <TextInput
        style={styles.input}
        value={fullName}
        onChangeText={setFullName}
        placeholder="Nhập họ và tên"
        maxLength={100}
      />

      <Text style={styles.label}>Số điện thoại</Text>
      <TextInput
        style={styles.input}
        value={phone}
        onChangeText={setPhone}
        placeholder="Nhập số điện thoại"
        keyboardType="phone-pad"
      />

      <Text style={styles.label}>Địa chỉ</Text>
      <TextInput
        style={[styles.input, styles.addressInput]}
        value={address}
        onChangeText={setAddress}
        placeholder="Nhập địa chỉ của bạn"
        multiline
        maxLength={250}
      />

      <Pressable
        style={[styles.saveButton, saving && styles.disabledButton]}
        onPress={onSave}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.saveButtonText}>Lưu thay đổi</Text>
        )}
      </Pressable>

      <Pressable
        style={styles.logoutButton}
        onPress={onLogout}
        disabled={loggingOut}
      >
        {loggingOut ? (
          <ActivityIndicator color="#DC5555" />
        ) : (
          <Text style={styles.logoutButtonText}>Đăng xuất khỏi tài khoản</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  label: {
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
  disabledInput: {
    backgroundColor: "#F3F4F6",
    color: "#888888",
  },
  note: {
    fontSize: 11,
    color: "#888888",
    marginTop: 5,
  },
  addressInput: {
    minHeight: 85,
    textAlignVertical: "top",
    paddingTop: 10,
  },
  saveButton: {
    backgroundColor: "#338DA3",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  disabledButton: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  logoutButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DC5555",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 12,
  },
  logoutButtonText: {
    color: "#DC5555",
    fontSize: 14,
    fontWeight: "bold",
  },
});
