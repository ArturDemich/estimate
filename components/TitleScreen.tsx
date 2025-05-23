import { UploadStatus } from "@/types/typesScreen";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";


interface TitleProps {
    title: string;
    adTitle?: string;
    docSent?: number;
};

const Title = ({ title, adTitle, docSent }: TitleProps) => {
    return (
        <View style={{maxWidth: 200}}>
            <View style={styles.titleBlock}>
                <Text style={styles.title}>{title}</Text>
                {(docSent === UploadStatus.OneC || docSent === UploadStatus.All) && <MaterialIcons name="cloud-done" size={16} color="rgb(77, 77, 77)" />}
                {(docSent === UploadStatus.Excel || docSent === UploadStatus.All) && <MaterialCommunityIcons name="microsoft-excel" size={18} color="rgb(77, 77, 77)" />}
            </View>
            {adTitle &&
                <View style={styles.adTitleBlock}>
                    <Text style={styles.adTitle}>{adTitle}</Text>
                </View>}
        </View>
    )
};

export default Title;


const styles = StyleSheet.create({
    titleBlock: {
        flexDirection: 'row',
        gap: 4,
    },
    title: {
        fontWeight: 600,
        fontSize: 19,
        lineHeight: 19,
        marginBottom: 5,
    },
    adTitleBlock: {
        flexDirection: 'row',
        gap: 3,
    },
    adTitle: {
        fontWeight: 500,
        fontSize: 11,
        lineHeight: 11,
        color: "rgb(143, 143, 143)",
    },
});