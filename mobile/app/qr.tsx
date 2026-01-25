import React from 'react';
import { View, Text, StyleSheet, Pressable, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from "@expo/vector-icons";

export default function QRScannerScreen() {
    const router = useRouter();

    return (
        <View className="flex-1 bg-black justify-center items-center p-6">
            <StatusBar barStyle="light-content" />
            <Text className="text-white text-xl font-bold mb-4">QR 스캐너 준비 중</Text>
            <Text className="text-slate-400 text-center mb-8">
                현재 카메라 라이브러리 설치 문제로 인해{"\n"}
                QR 스캔 기능을 잠시 사용할 수 없습니다.{"\n"}
                추후 업데이트 될 예정입니다.
            </Text>

            <Pressable
                onPress={() => router.back()}
                className="bg-indigo-600 px-8 py-3 rounded-xl"
            >
                <Text className="text-white font-bold">돌아가기</Text>
            </Pressable>
        </View>
    );
}
