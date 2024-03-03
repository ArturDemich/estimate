import { Button, StyleSheet, Text, View } from "react-native";



function DocumentScreen() {

    return (
        <View style={styles.container}>
            <View style={styles.itemRow}>
                <Text>1.</Text>
                <Text style={styles.text}>Chamaecyparis lawsoniana 'Ivonne', Кипарисовик Лавсона 'Івонн'</Text>
                <Text style={styles.text}>WRB, PA90-100, D40-50, FORM/CHUPA CHUPS</Text>
                <Text>20 шт</Text>
                <Text>+</Text>
            </View>

            <Text>Document</Text>
        </View>
    )
}

export default DocumentScreen;

const styles = StyleSheet.create({
    container: {
        
    },
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    text: {
        fontSize: 6,
    }
})