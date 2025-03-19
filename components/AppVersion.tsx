import { Text } from "react-native";
import Constants from 'expo-constants';



const AppVersion = () => {
    const ver = Constants.expoConfig?.version
    
    return (
        <Text style={{marginTop: 10, alignSelf: 'center'}}>V {ver}</Text>
    )
};

export default AppVersion;