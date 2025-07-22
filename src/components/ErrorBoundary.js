import { Link } from 'expo-router';
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '../constants/theme';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error("Uncaught error:", error, errorInfo);
  }

  handleGoHome = () => {
    this.setState({ hasError: false, error: null });
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Oops! Something went wrong.</Text>
          <Text style={styles.subtitle}>
            An unexpected error occurred. Please try restarting the app.
          </Text>
          <Text style={styles.errorText}>
            {this.state.error?.toString()}
          </Text>
          <Link href="/" asChild>
            <TouchableOpacity style={styles.button} onPress={this.handleGoHome}>
              <Text style={styles.buttonText}>Go to Home Screen</Text>
            </TouchableOpacity>
          </Link>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontFamily: theme.typography.fonts.bold,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: theme.typography.fonts.regular,
    color: theme.colors.gray,
    textAlign: 'center',
    marginBottom: 20,
  },
  errorText: {
    fontSize: 12,
    fontFamily: theme.typography.fonts.regular,
    color: theme.colors.error,
    textAlign: 'center',
    marginTop: 20,
  },
  button: {
    marginTop: 30,
    backgroundColor: theme.colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontFamily: theme.typography.fonts.bold,
    fontSize: 16,
  }
});

export default ErrorBoundary;
