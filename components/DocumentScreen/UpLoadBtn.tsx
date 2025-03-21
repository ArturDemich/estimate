import { DataService } from '@/axios/service';
import TouchableVibrate from '@/components/ui/TouchableVibrate';
import { getDocumentWithDetails, markDocumentAsSent } from '@/db/db.native';
import { setDocSent } from '@/redux/dataSlice';
import { TokenResponse } from '@/redux/stateServiceTypes';
import { AppDispatch, RootState } from '@/redux/store';
import { getPlantsNameDB } from '@/redux/thunks';
import { myToast } from '@/utils/toastConfig';
import { MaterialIcons } from '@expo/vector-icons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useLocalSearchParams } from 'expo-router';
import { Alert, StyleSheet, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

const UpLoadBtn = () => {
  const dispatch = useDispatch<AppDispatch>();
  const token = useSelector<RootState, TokenResponse | {}>((state) => state.login.token);
  const params = useLocalSearchParams();
  const docId = params.docId;

  const loadSendData = async () => {
    const data = await getDocumentWithDetails(Number(docId))
    console.log("UpLoadBtn data", JSON.stringify(data, null, 2));
    if (data) {
      try {
        if ("token" in token && typeof token.token === "string") {
          const res = await DataService.sendDataToServer(token.token, data)
          if (res) {
            await markDocumentAsSent(Number(docId));
            await dispatch(getPlantsNameDB({ docId: Number(docId) }))
          }
        } else {
          console.log("Cant load token. Resign",);
          myToast({
            type: "customError",
            text1: "Токен не вірний. Аторизуйтесь заново!",
            visibilityTime: 5000,
          });
        }

      } catch (error: any) {
        console.error("Cant upload doc", error);
        myToast({
          type: "customError",
          text1: "Відправка документа невдала!",
          text2: error?.message || "Помилка сервера",
          visibilityTime: 5000,
        });
      }
    } else {
      console.log("Cant load document from  DB",);
      myToast({
        type: "customError",
        text1: "Не вдалося отримати документ з БД!",
        visibilityTime: 5000,
      });
    }
  };

  const upload = async () => {
    Alert.alert(
      'Вивантаження документа',
      'Бажаєте відправит документ в 1С?',
      [{
        text: 'Скасувати',
        style: 'cancel'
      },
      {
        text: 'Відправити',
        onPress: async () => {
          console.log('UpLoadBtn res',)
          await markDocumentAsSent(Number(docId));
          await dispatch(setDocSent(1))
          //await dispatch(getPlantsNameDB({ docId: Number(docId) }))
          //loadSendData()
        },
      }]
    )
  }
  return (
    <View style={styles.containerNBTN}>
      <TouchableVibrate style={styles.buttonStep} onPress={upload}>
        {/* <FontAwesome name="upload" size={24} color='rgba(106, 159, 53, 0.95)' /> */}
        <MaterialIcons name="cloud-upload" size={30} color='rgba(106, 159, 53, 0.95)' />
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
    paddingVertical: 3,
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