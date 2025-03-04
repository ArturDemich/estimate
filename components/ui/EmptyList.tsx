import { Text, View } from "react-native";

const EmptyList = ({text}: {text: string}) => {
    return (
        <View style={{ alignItems: 'center', padding: 15 }}>
            <Text style={{ fontSize: 18, color: 'rgba(107, 107, 107, 0.85)' }}>{text}</Text>
        </View>
    )
}
export default EmptyList;