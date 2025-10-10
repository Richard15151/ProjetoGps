import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, Alert, Linking, ScrollView, Dimensions } from 'react-native';
import * as Location from 'expo-location';
import Markdown from 'react-native-markdown-display';
import WebView from 'react-native-webview'

// Usado para garantir uma altura consistente para o mapa (melhor ter valor fixo)
// const screenHeight = Dimensions.get('window').height; 

// 🔑 CHAVES DE API
const OPENCAGE_API_KEY = "668cb7b6a52a4d15a8de3f131d23ab51"
const OPENWEATHER_API_KEY = "11baabba2e39d1fe964a6668d8c8c1f6"
const WEATHER_BASE_URL = "http://api.openweathermap.org/data/2.5/weather"

const App = () => {
    // ... (Estados permanecem os mesmos)
    const [latitude, setLatitude] = useState(null);
    const [longitude, setLongitude] = useState(null);
    const [loading, setLoading] = useState(false);
    const [addressData, setAddressData] = useState(null);
    const [loadingAddress, setLoadingAddress] = useState(false);
    const [weatherData, setWeatherData] = useState(null);
    const [loadingWeather, setLoadingWeather] = useState(false);

    const getMyCurrentLocation = async () => {
        setLoading(true);
        setAddressData(null);
        setWeatherData(null);

        let { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== 'granted') {
            Alert.alert(
                'Permissão Negada',
                'Não podemos obter a localização sem a permissão. Por favor, ative nas configurações do dispositivo.'
            );
            setLoading(false);
            return;
        }

        try {
            let location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Highest,
            });

            const currentLat = location.coords.latitude;
            const currentLon = location.coords.longitude;

            setLatitude(currentLat);
            setLongitude(currentLon);

            Alert.alert('Sucesso!', 'Coordenadas obtidas com sucesso.');
        } catch (error) {
            console.error('Erro ao obter localização:', error);
            Alert.alert('Erro de GPS', 'Não foi possível obter a localização. Verifique o seu GPS.');
        } finally {
            setLoading(false);
        }
    };

    const openInGoogleMaps = () => {
        if (!latitude || !longitude) {
            Alert.alert('Erro', 'Por favor, obtenha a localização primeiro (Passo 1).');
            return;
        }

        const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

        Linking.openURL(url).catch((err) =>
            console.error('Ocorreu um erro ao abrir o link:', err)
        );
    };

    const getReverseGeocoding = async () => {
        if (!latitude || !longitude) {
            Alert.alert('Atenção', 'Primeiro, obtenha a sua localização (Passo 1).');
            return;
        }

        setLoadingAddress(true);
        setAddressData(null);

        try {
            const apiUrl = `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${OPENCAGE_API_KEY}`;

            const response = await fetch(apiUrl);
            const data = await response.json();

            if (data.results && data.results.length > 0) {
                const components = data.results[0].components;
                const formattedAddress = data.results[0].formatted;

                const extractedAddress = {
                    address: formattedAddress,
                    city: components.city || components.town || components.village || 'N/A',
                    state: components.state || components.state_code || 'N/A',
                    country: components.country || 'N/A',
                    postcode: components.postcode || 'N/A',
                    road: components.road || components.route || 'N/A',
                };

                setAddressData(extractedAddress);
                Alert.alert('Endereço Encontrado', extractedAddress.address);
            } else {
                Alert.alert('Erro', 'Não foi possível encontrar o endereço para esta coordenada.');
            }

        } catch (error) {
            console.error('Erro ao buscar endereço:', error);
            Alert.alert('Erro de Conexão', 'Não foi possível conectar ao serviço de endereço.');
        } finally {
            setLoadingAddress(false);
        }
    };

    const getWeatherInfo = async () => {
        if (!latitude || !longitude) {
            Alert.alert('Atenção', 'Primeiro, obtenha a sua localização (Passo 1).');
            return;
        }

        setLoadingWeather(true);
        setWeatherData(null);

        try {
            const url = `${WEATHER_BASE_URL}?lat=${latitude}&lon=${longitude}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=pt`;

            const response = await fetch(url);
            const data = await response.json();

            if (data.cod === 200) {
                const weather = {
                    main: data.weather[0].description,
                    temp: data.main.temp.toFixed(1),
                    feels_like: data.main.feels_like.toFixed(1),
                    humidity: data.main.humidity,
                    wind: data.wind.speed.toFixed(1),
                    city: data.name,
                };
                setWeatherData(weather);
                Alert.alert('Clima Encontrado', `Temperatura: ${weather.temp}°C em ${weather.city}`);
            } else {
                Alert.alert('Erro de Clima', data.message || 'Não foi possível obter dados de clima.');
            }

        } catch (error) {
            console.error('Erro ao buscar clima:', error);
            Alert.alert('Erro de Conexão', 'Não foi possível conectar ao serviço de clima.');
        } finally {
            setLoadingWeather(false);
        }
    };

    const renderAddressDetails = () => {
        if (!addressData) return null;
        const markdownContent = `
# Endereço Completo Encontrado:
- **Rua/Estrada:** ${addressData.road}
- **Cidade:** ${addressData.city}
- **Estado:** ${addressData.state}
- **CEP:** ${addressData.postcode}
- **País:** ${addressData.country}
        `;

        return (
            <View style={styles.addressDetailsContainer}>
                <Markdown style={markdownStyles}>
                    {markdownContent}
                </Markdown>
            </View>
        );
    };

    const renderWeatherDetails = () => {
        if (!weatherData) return null;

        const markdownContent = `
# Clima Atual em ${weatherData.city}:
- **Descrição:** ${weatherData.main}
- **Temperatura:** **${weatherData.temp}°C**
- **Sensação Térmica:** ${weatherData.feels_like}°C
- **Humidade:** ${weatherData.humidity}%
- **Vento:** ${weatherData.wind} m/s
        `;

        return (
            <View style={styles.weatherDetailsContainer}>
                <Markdown style={markdownStyles}>
                    {markdownContent}
                </Markdown>
            </View>
        );
    };

    return (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.containerScroll}>
            <Text style={styles.title}>Projeto Geolocalização</Text>

            {/* 1. PEGAR LOCALIZAÇÃO */}
            <Button
                title={loading ? "1. Buscando..." : "1. PEGAR MINHA LOCALIZAÇÃO (Coordenadas)"}
                onPress={getMyCurrentLocation}
                disabled={loading}
            />

            {/* BOTÃO DO MAPA EXTERNO */}
            {latitude && longitude && (
                <View style={styles.mapButtonContainer}>
                    <Button
                        title="Ver no Google Maps (Redirecionamento)"
                        onPress={openInGoogleMaps}
                        color="#4285F4"
                    />
                </View>
            )}

            <View style={styles.infoContainer}>
                <Text style={styles.label}>
                    Latitude:
                    <Text style={styles.value}>
                        {latitude || ' -- '}
                    </Text>
                </Text>
                <Text style={styles.label}>
                    Longitude:
                    <Text style={styles.value}>
                        {longitude || ' -- '}
                    </Text>
                </Text>
            </View>

            {/* SEPARADOR PARA AS OPÇÕES 2 E 3 */}
            <View style={styles.otherOptionsContainer}>

                {/* 2. CONSULTAR ENDEREÇO COMPLETO */}
                <Button
                    title={loadingAddress ? "2. Buscando Endereço..." : "2. CONSULTAR ENDEREÇO COMPLETO"}
                    onPress={getReverseGeocoding}
                    disabled={!latitude || loadingAddress}
                />

                {/* EXIBIÇÃO DO ENDEREÇO */}
                {renderAddressDetails()}

                <View style={{ marginTop: 20 }}>
                    {/* 3. CONSULTAR CLIMA DO LOCAL */}
                    <Button
                        title={loadingWeather ? "3. Buscando Clima..." : "3. CONSULTAR CLIMA DO LOCAL"}
                        onPress={getWeatherInfo}
                        disabled={!latitude || loadingWeather}
                    />
                </View>

                {/* EXIBIÇÃO DO CLIMA */}
                {renderWeatherDetails()}
            </View>
        </ScrollView>
    );
};

const markdownStyles = {
    heading1: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 5,
        marginBottom: 10,
        color: '#005cb3',
    },
    list_item: {
        fontSize: 14,
        marginBottom: 4,
        color: '#333',
    },
    strong: {
        fontWeight: '900',
    },
    body: {
        fontSize: 14,
    }
};

const styles = StyleSheet.create({
    containerScroll: {
        padding: 20,
        backgroundColor: '#f0f4f7',
        minHeight: '100%'
    },
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f0f4f7',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        color: '#333',
    },
    mapButtonContainer: {
        marginTop: 15,
        marginBottom: 15,
    },
    infoContainer: {
        marginTop: 20,
        padding: 15,
        backgroundColor: '#fff',
        borderRadius: 8,
        borderLeftWidth: 5,
        borderLeftColor: '#007aff',
    },
    addressDetailsContainer: {
        marginTop: 15,
        padding: 15,
        backgroundColor: '#e6f7ff',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#b3e0ff'
    },
    weatherDetailsContainer: {
        marginTop: 15,
        padding: 15,
        backgroundColor: '#fffbe6',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ffe58f'
    },
    addressTitle: {
        fontWeight: 'bold',
        fontSize: 16,
        marginBottom: 8,
        color: '#005cb3',
    },
    weatherTitle: {
        fontWeight: 'bold',
        fontSize: 16,
        marginBottom: 8,
        color: '#d46b08',
    },
    addressLine: {
        fontSize: 14,
        marginBottom: 4,
    },
    weatherLine: {
        fontSize: 14,
        marginBottom: 4,
    },
    label: {
        fontSize: 16,
        color: '#555',
        marginBottom: 5,
    },
    value: {
        fontWeight: 'bold',
        color: '#000',
    },
    otherOptionsContainer: {
        marginTop: 40,
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: '#ccc',
        marginBottom: 40, // Adiciona margem no final para garantir que o último item não seja cortado
    }
});

export default App;