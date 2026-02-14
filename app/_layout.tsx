import { Stack } from 'expo-router';
import { WorkoutProvider } from '../context/WorkoutContext';

export default function Layout() {
  return (
    <WorkoutProvider>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: '#f4511e',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
    </WorkoutProvider>
  );
}
