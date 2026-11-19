import * as ImagePicker from "expo-image-picker";
import { Directory, File, Paths } from "expo-file-system";

// Chọn ảnh từ Album/Gallery và lưu cố định vào bộ nhớ ứng dụng
export async function pickProductImage(): Promise<string | null> {
  // 1. Mở Album trên điện thoại
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing: false,
    quality: 1,
  });

  if (result.canceled || !result.assets?.length) {
    return null;
  }

  const selectedAsset = result.assets[0];

  // 2. Tạo thư mục product-images nếu chưa tồn tại
  const imageDirectory = new Directory(Paths.document, "product-images");
  imageDirectory.create({
    idempotent: true,
    intermediates: true,
  });

  // 3. Xác định đuôi mở rộng
  let extension = selectedAsset.fileName?.split(".").pop()?.toLowerCase();
  if (!extension || extension === selectedAsset.fileName?.toLowerCase()) {
    extension = selectedAsset.mimeType?.split("/")[1]?.toLowerCase() || "jpg";
  }
  if (extension === "jpeg") extension = "jpg";
  if (!/^[a-z0-9]+$/.test(extension)) extension = "jpg";

  // 4. Tạo tên file mới duy nhất
  const fileName = `product_${Date.now()}.${extension}`;
  const destinationFile = new File(imageDirectory, fileName);

  // 5. Sao chép ảnh vào bộ nhớ ứng dụng
  const sourceFile = new File(selectedAsset.uri);
  await sourceFile.copy(destinationFile);

  return destinationFile.uri;
}
