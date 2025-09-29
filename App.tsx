import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import WelcomeScreen from './Screens/WelcomeScreen';

export default function App() {
  return (
    <View style = {styles.container}>
     <WelcomeScreen/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(215, 215, 213, 1)",
    alignItems: 'center',
    justifyContent: 'center',
  },
});
