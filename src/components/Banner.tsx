
import { useEffect, useRef, useState } from "react";
import {
  View,
  Image,
  ScrollView,
  StyleSheet,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";

const banners = [
  {
    id: "banner1",
    image: require("../assets/images/banners/banner-1-welcome.jpg"),
  },
  {
    id: "banner2",
    image: require("../assets/images/banners/banner-2-stationery.jpg"),
  },
  {
    id: "banner3",
    image: require("../assets/images/banners/banner-3-study.jpg"),
  },
];

export default function Banner() {
  const scrollRef = useRef<ScrollView | null>(null);
  const activeIndexRef = useRef(0);

  const [activeIndex, setActiveIndex] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);

  // Tự động chuyển banner sau mỗi 4 giây
  useEffect(() => {
    if (containerWidth <= 0) return;

    const interval = setInterval(() => {
      const nextIndex =
        (activeIndexRef.current + 1) % banners.length;

      activeIndexRef.current = nextIndex;
      setActiveIndex(nextIndex);

      scrollRef.current?.scrollTo({
        x: nextIndex * containerWidth,
        animated: true,
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [containerWidth]);

  // Đồng bộ khi người dùng tự vuốt banner
  const handleScrollEnd = (
    event: NativeSyntheticEvent<NativeScrollEvent>
  ) => {
    if (containerWidth <= 0) return;

    const offsetX = event.nativeEvent.contentOffset.x;

    const index = Math.round(offsetX / containerWidth);

    activeIndexRef.current = index;
    setActiveIndex(index);
  };

  return (
    <View style={styles.container}>
      {/* Danh sách banner */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        bounces={false}
        onLayout={(event) => {
          setContainerWidth(event.nativeEvent.layout.width);
        }}
        onMomentumScrollEnd={handleScrollEnd}
      >
        {containerWidth > 0 &&
          banners.map((banner) => (
            <Image
              key={banner.id}
              source={banner.image}
              style={[
                styles.bannerImage,
                { width: containerWidth },
              ]}
              resizeMode="cover"
            />
          ))}
      </ScrollView>

      {/* Các dấu chấm thể hiện vị trí banner */}
      <View style={styles.pagination}>
        {banners.map((banner, index) => (
          <View
            key={banner.id}
            style={[
              styles.dot,
              activeIndex === index && styles.activeDot,
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginBottom: 12,
  },
  bannerImage: {
    aspectRatio: 1280 / 414,
    borderRadius: 15,
    backgroundColor: "#EAF5F8",
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    gap: 7,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#D6DCE2",
  },
  activeDot: {
    width: 19,
    backgroundColor: "#338DA3",
  },
});
