# Happy - Stationery Store App

Học tập vui hơn, mỗi ngày tiện hơn.

A mobile application for browsing and purchasing stationery and office supplies.

---

## 📖 About The Project

**Happy** is a mobile e-commerce application developed using React Native and Expo. The application provides a convenient shopping experience for students and people who need stationery and office supplies.

Users can browse products, explore categories, manage their shopping carts, and place orders through a simple and user-friendly interface.

The application also includes an administrative interface that allows administrators to manage products and perform basic store management operations.

**Project Information**

| Item                  | Description                                               |
| --------------------- | --------------------------------------------------------- |
| Project Name          | Happy - Stationery Store App                              |
| Project Type          | Mobile E-commerce Application                             |
| Platform              | Android, iOS, Web                                         |
| Development Framework | React Native + Expo                                       |
| Programming Language  | TypeScript                                                |
| Database              | SQLite                                                    |
| Architecture          | Component-based architecture                              |
| Repository            | [GitHub](https://github.com/ThiMung/stationery-store-app) |

## ✨ Features

### 👤 1. User Features

**Authentication**

- Register a new account.
- Log in with an existing account.
- Access account-related features.
- Role-based navigation.

**Product Browsing**

- View available stationery products.
- Browse products by category.
- View product details and images.
- Explore products through the home screen.

**Shopping Cart**

- Add products to the shopping cart.
- Update product quantities.
- Remove products from the cart.
- Calculate the total order amount.

**Order Management**

- Place orders through the checkout process.
- Save order information.
- View order history.

**User Interface**

- Modern and user-friendly interface.
- Promotional banner carousel.
- Product categories and product listings.
- Bottom tab navigation.
- Shopping cart icon with item count.

### 🛠️ 2. Admin Features

- Access the administrative interface.
- View and manage products.
- Add new products.
- Upload product images from the device gallery.
- Manage product information.
- Support basic product and store management operations.

### 📱 3. Additional Features

- Local database management using SQLite.
- Image selection from the device gallery.
- Reusable React Native components.
- Role-based navigation for different users.
- Responsive layouts and safe area handling.

---

## 🧰 Technology Stack

The application is developed using the following technologies and libraries:

| Technology                     | Description                                   |
| ------------------------------ | --------------------------------------------- |
| React Native 0.88.1            | Cross-platform mobile application development |
| Expo SDK 58                    | Development environment and native APIs       |
| React 19.3.0                   | Building user interfaces                      |
| TypeScript 6.0.3               | Static typing and maintainable code           |
| Expo Router                    | File-based navigation                         |
| Expo SQLite                    | Local database management                     |
| Expo Image                     | Image rendering and display                   |
| Expo Image Picker              | Selecting images from the device gallery      |
| Expo Image Manipulator         | Image processing                              |
| React Native Reanimated        | Animations                                    |
| React Native Gesture Handler   | Gesture interactions                          |
| React Native Safe Area Context | Safe area management                          |
| React Native Screens           | Native screen management                      |
| npm                            | Package management                            |

---

## 📂 Project Structure

The project is organized into reusable components, application screens, and supporting modules to make the code easier to maintain and extend.

```text
stationery-store-app/
│
├── assets/
│   ├── fonts/                         # Custom fonts
│   └── images/                        # App images, banners and icons
│
├── scripts/
│   └── reset-project.js                # Project reset script
│
├── src/
│   │
│   ├── app/                            # Application screens and navigation
│   │   ├── _layout.tsx                 # Root navigation layout
│   │   ├── (tabs)/                     # Main tab navigation
│   │   └── ...                         # Other application routes
│   │
│   ├── components/                     # Reusable UI components
│   │   │
│   │   ├── HomeTopBar.tsx              # Home header and shopping cart
│   │   ├── Banner.tsx                  # Promotional banner carousel
│   │   ├── CategorySelector.tsx        # Product category selection
│   │   │
│   │   └── ...                         # Other reusable components
│   │
│   └── ...                             # Supporting modules and utilities
│
├── .claude/                            # Claude Code configuration
├── .idea/                              # IDE configuration
├── .vscode/                            # VS Code configuration
│
├── .gitignore                          # Git ignored files
├── AGENTS.md                           # Agent instructions
├── CLAUDE.md                           # Claude Code instructions
├── app.json                            # Expo application configuration
├── package.json                        # Dependencies and scripts
├── package-lock.json                   # Dependency lock file
├── tsconfig.json                       # TypeScript configuration
├── LICENSE                             # MIT License
└── README.md                           # Project documentation
```

### 📌 Main Components

| Component              | Responsibility                                                       |
| ---------------------- | -------------------------------------------------------------------- |
| `HomeTopBar.tsx`       | Displays the application logo and shopping cart icon with item count |
| `Banner.tsx`           | Displays promotional banners in a carousel                           |
| `CategorySelector.tsx` | Displays product categories and allows users to select a category    |

### 📌 Main Application Modules

| Module         | Responsibility                                        |
| -------------- | ----------------------------------------------------- |
| Home           | Displays the main storefront and featured content     |
| Products       | Displays product listings and product information     |
| Authentication | Handles user registration and login                   |
| Cart           | Manages shopping cart items and quantities            |
| Checkout       | Handles order confirmation and checkout               |
| Orders         | Displays order information and order history          |
| Admin          | Provides product management functionality             |
| Database       | Handles SQLite initialization and database operations |

*Note: The directory tree above highlights the main project areas and confirmed component names. The module descriptions explain application responsibilities rather than claiming every module is a separate folder or file.*

---

## 🚀 Getting Started

Follow the instructions below to set up and run the application on your local machine.

### 1. Prerequisites

Make sure you have installed the following tools:

- [Node.js](https://nodejs.org/) (LTS version recommended)
- npm
- [Git](https://git-scm.com/)
- [Visual Studio Code](https://code.visualstudio.com/)
- [Android Studio](https://developer.android.com/studio) (for Android Emulator)

You can also use Expo Go on a compatible Android device for testing.

### 2. Clone the Repository

```bash
git clone https://github.com/ThiMung/stationery-store-app.git
```

### 3. Navigate to the Project Directory

```bash
cd stationery-store-app
```

### 4. Install Dependencies

```bash
npm install
```

### 5. Start the Development Server

```bash
npx expo start
```

---

## ▶️ Running the Application

After starting the development server, you can choose one of the following options.

### Android Emulator

1. Open Android Studio.
2. Start an Android Virtual Device (AVD).
3. Run the following command:

```bash
npm run android
```

Alternatively, press `a` in the Expo terminal.

### Physical Android Device

1. Install Expo Go if your device supports the project's SDK.
2. Connect your computer and phone to the same Wi-Fi network.
3. Start the development server:

```bash
npx expo start
```

4. Scan the QR code using Expo Go.

If the connection does not work, try tunnel mode:

```bash
npx expo start --tunnel
```

### iOS Simulator

```bash
npm run ios
```

*Note: Running the iOS Simulator requires macOS and Xcode.*

### Web Browser

```bash
npm run web
```

---

## 🗄️ Database

Happy uses **Expo SQLite** to store and manage application data locally.

SQLite provides a lightweight relational database that allows the application to store structured information directly on the device.

The database supports the following data:

- User accounts.
- Product information.
- Product categories.
- Shopping cart information.
- Customer orders.

### Database Operations

The application includes database operations for:

- Initializing the local database.
- Creating database tables.
- Inserting initial product data.
- Retrieving products and categories.
- Managing shopping cart data.
- Saving and retrieving orders.

Database initialization and data operations are handled through the application's database module.

---

## 👥 Application Roles

Happy supports two main roles with different navigation experiences.

| Feature                 | Customer | Administrator |
| ----------------------- | :------: | :-----------: |
| Browse products         |     ✓    |       ✓       |
| View product categories |     ✓    |       ✓       |
| Manage shopping cart    |     ✓    |       -       |
| Place orders            |     ✓    |       -       |
| View order history      |     ✓    |       -       |
| Manage products         |     -    |       ✓       |
| Upload product images   |     -    |       ✓       |

---

## 🧪 Development Commands

The following commands are available in the project:

| Command                 | Description                         |
| ----------------------- | ----------------------------------- |
| `npm install`           | Install project dependencies        |
| `npx expo start`        | Start the Expo development server   |
| `npm run android`       | Run the application on Android      |
| `npm run ios`           | Run the application on iOS          |
| `npm run web`           | Run the application on Web          |
| `npm run lint`          | Run Expo lint checks                |
| `npm run reset-project` | Reset the starter project structure |

---

## 🔮 Future Improvements

Potential improvements for future development include:

- Integrating a remote backend and online database.
- Implementing online payment methods.
- Adding product search and advanced filtering.
- Improving order tracking and order status management.
- Adding product reviews and ratings.
- Developing an admin dashboard with sales statistics.
- Enhancing application performance and user experience.

---

## 👩‍💻 Author

**Đinh Thị Mừng**

Software Engineering Student
Passerelles Numériques Vietnam (PNV)

- GitHub: [@ThiMung](https://github.com/ThiMung)
- Repository: [Happy - Stationery Store App](https://github.com/ThiMung/stationery-store-app)

---

Happy - Học tập vui hơn, mỗi ngày tiện hơn. ❤️

Thank you for visiting this project!
