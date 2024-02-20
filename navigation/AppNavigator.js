import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {View} from 'react-native';
import HomeScreen from '../screen/Home';
import DocumentScreen from '../screen/Document';

const Stack = createNativeStackNavigator();

export default function Navigate() {
  return (
    <View style={{display: 'flex', flex: 1}}>
      <View
        style={{
          maxWidth: 750,
          minWidth: 250,
          width: '100%',
          alignSelf: 'center',
          flex: 1,
        }}>
        <Stack.Navigator screenOptions={{headerStyle: {height: 55}}}>
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{title: 'Home'}}
          />
          <Stack.Screen
            name="Document"
            component={DocumentScreen}
            options={{title: 'Document'}}
          />
        </Stack.Navigator>
      </View>
    </View>
  );
}
