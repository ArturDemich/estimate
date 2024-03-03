import { useNavigation } from '@react-navigation/native';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';

function DocumentList() {
    const navigation = useNavigation()
    
  return (
    <View>
    <TouchableOpacity 
    style={styles.documentItem}
    onPress={() => {
        navigation.navigate('Document')
    }}
    >
      <View style={styles.itemRow}>
        <Text>Дубриничі</Text>
        <Text>02.03.2024 - 15:00</Text>
      </View>
    </TouchableOpacity>
    <View style={styles.documentItem}>
      <View style={styles.itemRow}>
        <Text>Дубриничі</Text>
        <Text>02.03.2024 - 15:00</Text>
      </View>
    </View>
      
    </View>
  );
}

export default DocumentList;


const styles = StyleSheet.create({
    container: {
        
    },
    documentItem: {
        backgroundColor: '#fff',
        borderBottomColor: 'black',
        justifyContent: 'center',
        minHeight: 40,
        borderRadius: 5,
        margin: 5,
        paddingLeft: 10,
        paddingRight: 10,
        elevation: 10,
        shadowColor: 'black',
        shadowOpacity: 0.4,
        shadowOffset: { width: 0, height: 0 },
        shadowRadius: 7,
    },
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
})