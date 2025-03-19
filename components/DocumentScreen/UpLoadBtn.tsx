import { DataService } from '@/axios/service';
import TouchableVibrate from '@/components/ui/TouchableVibrate';
import { getDocumentWithDetails } from '@/db/db.native';
import { TokenResponse } from '@/redux/stateServiceTypes';
import { RootState } from '@/redux/store';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useLocalSearchParams } from 'expo-router';
import { Alert, StyleSheet, View } from 'react-native';
import { useSelector } from 'react-redux';

const UpLoadBtn = () => {
  const token = useSelector<RootState, TokenResponse | {}>((state) => state.login.token)
  const params = useLocalSearchParams();
  const docId = params.docId;

  const loadSendData = async () => {
    const data = await getDocumentWithDetails(Number(docId))
    console.log("UpLoadBtn data", JSON.stringify(data, null, 2));
    if (data && "token" in token && typeof token.token === "string") {
      //const res = await DataService.sendDataToServer(token.token, data)
      Alert.alert(
        'Вивантаження документа',
        'Бажаєте відправит документ в 1С?',
        [
          {
            text: 'Скасувати',
            style: 'cancel'
          },
          {
            text: 'Відправити',
            onPress: async () => {
              console.log('UpLoadBtn res',)
            },
          }
        ]
      )
    }
  }
  return (
    <View style={styles.containerNBTN}>
      <TouchableVibrate style={styles.buttonStep} onPress={loadSendData}>
        <FontAwesome name="upload" size={24} color='rgba(106, 159, 53, 0.95)' />
      </TouchableVibrate>
    </View>
  )
}
export default UpLoadBtn;

const styles = StyleSheet.create({
  containerNBTN: {
    elevation: 5,
    position: "absolute",
    right: '45%',
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