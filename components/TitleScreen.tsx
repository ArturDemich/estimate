import { StyleSheet, Text, View } from "react-native";


interface TitleProps {
    title: string;
    adTitle?: string;
};

const Title = ({ title, adTitle }: TitleProps) => {
    return (
        <View>
            <Text style={styles.title}>{title}</Text>
            {adTitle &&
            <View style={styles.adTitleBlock}>
                <Text style={styles.adTitle}>від: {adTitle}</Text>
            </View>}
        </View>
    )
};

export default Title;


const styles = StyleSheet.create({
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