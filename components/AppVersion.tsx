import { Text } from "react-native";
import Constants from 'expo-constants';



const AppVersion = ({styles}: {styles?: any}) => {
    const ver = Constants.expoConfig?.version
    
    return (
        <Text style={[{marginTop: 10, alignSelf: 'center'}, styles]}>V {ver}</Text>
    )
};

export default AppVersion;