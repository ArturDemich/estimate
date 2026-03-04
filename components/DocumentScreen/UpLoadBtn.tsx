import { DataService } from '@/axios/service';
import TouchableVibrate from '@/components/ui/TouchableVibrate';
import { getDocumentWithDetails, markDocumentAsSent } from "@/db/db";
import { setDocSent } from '@/redux/dataSlice';
import { TokenResponse } from '@/redux/stateServiceTypes';
import { AppDispatch, RootState } from '@/redux/store';
import { UploadStatus } from '@/types/typesScreen';
import { myToast } from '@/utils/toastConfig';
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Modal, StyleSheet, Text, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

const UpLoadBtn = () => {
  const dispatch = useDispatch<AppDispatch>();
  const token = useSelector<RootState, TokenResponse | {}>((state) => state.login.token);
  const docSent = useSelector<RootState, number>((state) => state.data.docSent);
  const params = useLocalSearchParams();
  const docId = params.docId;
  const [showModal, setShowModal] = useState(false);

  const sendToExcel = async () => {
    const data = await getDocumentWithDetails(Number(docId));
    //console.log("UpLoadBtn data", JSON.stringify(data, null, 2));
    if (data) {
      try {
        const res = await DataService.sendDataToExcel(data)
        if (res && res.fileId) {
          if (docSent === UploadStatus.Start) {
            await markDocumentAsSent(Number(docId), UploadStatus.Excel);
            await dispatch(setDocSent(UploadStatus.Excel));
          } else if (docSent === UploadStatus.OneC) {
            await markDocumentAsSent(Number(docId), UploadStatus.All);
            await dispatch(setDocSent(UploadStatus.All));
          }
          setShowModal(false)
          myToast({
            type: "customToast",
            text1: "Excel документ завантажено G-Drive!",
            text2: res?.message || "Вдалось!",
            visibilityTime: 5000,
          });
        }
      } catch (error: any) {
        console.error("Cant upload doc Excel", error);
        myToast({
          type: "customError",
          text1: "Відправка Excel документа невдала !",
          text2: error?.message || "Помилка сервера",
          visibilityTime: 5000,
        });
      };
    } else {
      console.log("Cant load document from  DB",);
      myToast({
        type: "customError",
        text1: "Не вдалося отримати документ з БД!",
        visibilityTime: 5000,
      });
    }
  };

  const loadSendData = async () => {
    const data = await getDocumentWithDetails(Number(docId))
    //console.log("UpLoadBtn data", JSON.stringify(data, null, 2));
    if (data) {
      try {
        if ("token" in token && typeof token.token === "string") {
          const res = await DataService.sendDataToServer(token.token, data)
          if (res && res.success) {
            if (docSent === UploadStatus.Start) {
              await markDocumentAsSent(Number(docId), UploadStatus.OneC);
              await dispatch(setDocSent(UploadStatus.OneC));
            } else if (docSent === UploadStatus.Excel) {
              await markDocumentAsSent(Number(docId), UploadStatus.All);
              await dispatch(setDocSent(UploadStatus.All));
            }
            setShowModal(false)
            myToast({
              type: "customToast",
              text1: "Документ завантажено в 1С!",
              text2: res?.message || "Вдалось!",
              visibilityTime: 5000,
            });
          }
        } else {
          console.error("Cant load token. ReSign",);
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

  return (
    <>
      <View style={styles.containerNBTN}>
        <TouchableVibrate style={styles.buttonStep} onPress={() => setShowModal(true)}>
          <MaterialIcons name="cloud-upload" size={30} color='rgba(106, 159, 53, 0.95)' />
        </TouchableVibrate>
      </View>
      <Modal visible={showModal} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={{ width: '100%', gap: 12 }}>
              <Text style={styles.title1}>Вивантаження документа</Text>
              <Text style={styles.title2}>Бажаєте відправити документ в ?</Text>
            </View>


            <View style={styles.btnBlock}>
              <LoadBtn key={'closeLoad'} press={() => setShowModal(false)} title={'❌'} />
              <LoadBtn key={'excelLoad'} press={() => sendToExcel()} title={'📗 Excel в 🅖'} />
              <LoadBtn key={'oneCLoad'} press={() => loadSendData()} title={'📤 в 1С'} />
            </View>
          </View>
        </View>
      </Modal>
    </>
  )
};
export default UpLoadBtn;

interface LoadBtnProps {
  press: () => void;
  title: string;
};
const LoadBtn = ({ press, title }: LoadBtnProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const upload = async () => {
    setIsLoading(true)
    await press()
    setIsLoading(false)
  };

  return (
    <TouchableVibrate onPress={() => upload()} style={[styles.uploadBtn]}>
      {isLoading ? <ActivityIndicator size="small" color="#ff6f61" /> : <Text>{title}</Text>}
    </TouchableVibrate>
  )
};

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
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
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
  modalContainer: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.2)",
  },
  modalContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
    width: "90%",
    height: '20%',
    top: 200,
    justifyContent: 'space-between'
  },
  title1: {
    fontSize: 15,
    fontWeight: 600,
    alignSelf: 'center',
    color: 'rgba(89, 89, 89, 0.85)'
  },
  title2: {
    fontSize: 18,
    fontWeight: 500,
  },
  btnBlock: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  uploadBtn: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgb(199, 199, 199)',
    paddingHorizontal: 5,
    paddingVertical: 8,
    elevation: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.93)',
    minWidth: 35,
    alignItems: 'center'
  }
})