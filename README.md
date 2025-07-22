# Flow Day Mobile

Flow Day Mobile is a powerful and intuitive application designed to help you structure your day, build productive routines, and stay focused on your tasks. Create custom workflows from reusable blocks and actions to streamline your daily activities.

## Features

*   **Routine Management:** Create, customize, reorder, and delete daily routines.
*   **Block-Based System:** Build routines by combining reusable blocks of actions.
*   **Action Library:** Create a library of actions with specific durations (timers) that can be added to any block.
*   **Draggable Interface:** Easily reorder routines, blocks, and actions with a simple drag-and-drop interface.
*   **Progress Tracking:** Run your routines and track your progress in real-time.
*   **Customization:** Personalize routines with unique colors and icons.

## App Installation (Android)

You can download and install the latest versions of the app directly from the releases page:

*   [**Latest Release (v1.9.0)**](https://github.com/jon-garmilla-dev/Flow-Day-mobile/releases/tag/v1.9.0)
*   [**Previous Stable Release (v1.8.0)**](https://github.com/jon-garmilla-dev/Flow-Day-mobile/releases/tag/v1.8.0)

## Project Structure

The project is organized into the following main directories:

*   **/app:** Contains all the screens and navigation logic, managed by Expo Router. Each file in this directory corresponds to a route in the app.
*   **/src:** The core of the application, containing the business logic, UI components, and state management.
    *   **/src/components:** Reusable React components used throughout the app (e.g., buttons, modals, layouts).
    *   **/src/store:** State management stores built with Zustand, handling routines, actions, and blocks.
    *   **/src/constants:** Global constants like theme colors and layout spacing.
    *   **/src/types:** TypeScript type definitions for the main data structures (Routine, Block, Action).
*   **/assets:** Static assets like fonts, icons, and splash screens.

## Development Setup

### Prerequisites

*   Node.js (v18 or newer)
*   npm or yarn
*   Expo CLI

### Project Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/jon-garmilla-dev/jon-garmilla-dev-Flow-Day.apk.git
    ```
2.  Navigate to the project directory:
    ```bash
    cd jon-garmilla-dev-Flow-Day-mobile
    ```
3.  Install the dependencies:
    ```bash
    npm install
    ```

### Running the App for Development

To run the app on your local device for testing, ensure your computer and mobile device are on the same network. Then, run the following command to start the Expo development server:

```bash
npm start -- --clear
```

This will clear the cache and start the server, after which you can scan the QR code with the Expo Go app on your device.

## Development Workflow & Contributing

The contribution workflow is designed to be simple and efficient.

1.  **Sync with the latest changes:**
    Before starting any work, pull the latest changes from the `main` branch.
    ```bash
    git pull origin main --no-rebase
    ```
2.  **Make your changes:**
    Work on your feature or bugfix and make commits as you go.
3.  **Push your changes:**
    Once you are done, push your commits to the repository.
    ```bash
    git push
    ```
4.  **Run CI/CD Actions:**
    After pushing, you must manually trigger the corresponding GitHub Actions workflow to run tests and build the app.

## Changelog

All notable changes to this project are documented in the [CHANGELOG.md](CHANGELOG.md) file.

## Tech Stack

*   **React Native:** A framework for building native apps using React.
*   **Expo:** A platform for making universal React applications.
*   **Expo Router:** A file-based router for React Native and web applications.
*   **TypeScript:** A typed superset of JavaScript that compiles to plain JavaScript.
*   **Zustand:** A small, fast, and scalable state-management solution for React.

## License

This project is licensed under the MIT License.
