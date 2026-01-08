//import liraries
import { useAppContext } from '@/app/AppProvider';
import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ModalHelpProps {
    showSetting: boolean;
    onClose: () => void;
    changeBlock: () => void;
    removeCell: () => void;
    disableChange?: boolean;
    disableRemove?: boolean;
}
enum Theme {
    Light = 'light',
    Dark = 'dark',
}

// create a component
const ModalHelp: React.FC<ModalHelpProps> = ({ showSetting, onClose, changeBlock, removeCell, disableChange, disableRemove }) => {
    const { soundEnabled, setSoundEnabled, theme, setTheme } = useAppContext();
    // const [sound, setSound] = React.useState(true);
    // const [theme, setTheme] = React.useState(Theme.Light);
    return (
        < Modal
            visible={showSetting}
            transparent
            animationType="slide"
            onRequestClose={() => onClose()}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.settingModalBox}>
                    {/* Header */}
                    <View style={styles.settingHeader}>
                        <Text style={styles.settingHeaderText}>HELP ME</Text>
                    </View>
                    {/* Icon row */}
                    <View style={styles.settingIconRow}>
                        <TouchableOpacity
                            style={[styles.settingIconWrapper, disableRemove && { opacity: 0.5 }]}
                            onPress={removeCell}
                            disabled={!!disableRemove}
                        >
                            <View style={[styles.settingCircle, { backgroundColor: soundEnabled ? '#7ED957' : '#CCCCCC' }]}>
                                <Text style={styles.settingCircleIcon}>🔨</Text>
                            </View>
                            <Text style={styles.settingIconLabel}>Remove Cell</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.settingIconWrapper, disableChange && { opacity: 0.5 }]}
                            onPress={changeBlock}
                            disabled={!!disableChange}
                        >
                            <View style={[styles.settingCircle, { backgroundColor: theme === Theme.Dark ? '#1e1f1dff' : '#ffffffff' }]}>
                                <Text style={styles.settingCircleIcon}>🔄</Text>
                            </View>
                            <Text style={styles.settingIconLabel}>Change Block</Text>
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity style={styles.settingBigButtonRed} onPress={() => onClose()}>
                        <Text style={styles.settingBigButtonText}>← BACK</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal >
    );
};

// define your styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#2c3e50',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    settingModalBox: {
        width: 320,
        backgroundColor: '#F9EEDB',
        borderRadius: 24,
        padding: 20,
        alignItems: 'center',
        borderWidth: 4,
        borderColor: '#A97B50',
        shadowColor: '#A97B50',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
        elevation: 16,
    },
    settingHeader: {
        backgroundColor: '#A97B50',
        borderRadius: 16,
        paddingHorizontal: 32,
        paddingVertical: 8,
        marginBottom: 18,
        shadowColor: '#7B4F1D',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.7,
        shadowRadius: 8,
        elevation: 8,
    },
    settingHeaderText: {
        color: '#FFD93D',
        fontSize: 26,
        fontWeight: '900',
        letterSpacing: 2,
        textAlign: 'center',
        textShadowColor: '#7B4F1D',
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 2,
    },
    settingIconRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 24,
        marginTop: 8,
    },
    settingIconWrapper: {
        alignItems: 'center',
        flex: 1,
    },
    settingCircle: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 4,
        shadowColor: '#888',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
    },
    settingCircleIcon: {
        fontSize: 28,
    },
    settingIconLabel: {
        fontSize: 14,
        color: '#7B4F1D',
        fontWeight: 'bold',
        marginTop: 2,
    },
    settingBigButtonGreen: {
        width: '100%',
        backgroundColor: '#7ED957',
        borderRadius: 18,
        paddingVertical: 14,
        marginVertical: 6,
        alignItems: 'center',
        shadowColor: '#4E9A06',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 6,
        borderWidth: 2,
        borderColor: '#A3E635',
    },
    settingBigButtonRed: {
        width: '100%',
        backgroundColor: '#FF5C5C',
        borderRadius: 18,
        paddingVertical: 14,
        marginVertical: 6,
        alignItems: 'center',
        shadowColor: '#B91C1C',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 6,
        borderWidth: 2,
        borderColor: '#F87171',
    },
    settingBigButtonText: {
        color: '#fff',
        fontSize: 22,
        fontWeight: 'bold',
        letterSpacing: 1,
        textShadowColor: '#000',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
});

//make this component available to the app
export default ModalHelp;
