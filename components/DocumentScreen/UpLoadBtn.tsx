import TouchableVibrate from '@/components/ui/TouchableVibrate';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { StyleSheet, View } from 'react-native';

const UpLoadBtn = () => {
    return (
        <View style={styles.containerNBTN}>
        <TouchableVibrate style={styles.buttonStep}>
            <FontAwesome name="upload" size={24} color="black" />
        </TouchableVibrate>
        </View>
    )
}
export default UpLoadBtn;

const styles = StyleSheet.create({
  containerNBTN: {
    elevation: 5,
    position: "absolute",
    left: 12,
    bottom: 15,
  },
  buttonStep: {
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 5,
    opacity: 0.95,
    elevation: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderColor: '#E4E4E7',
    shadowColor: "#131316",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 3,
    display: 'flex',
    flexDirection: 'row',
    gap: 3,
    alignItems: 'center',

  },
})