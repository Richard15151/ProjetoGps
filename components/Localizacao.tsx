import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Linking,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import * as Location from 'expo-location';
import Markdown from 'react-native-markdown-display';
import { WebView } from 'react-native-webview';

const OPENCAGE_API_KEY = "668cb7b6a52a4d15a8de3f131d23ab51";
const OPENWEATHER_API_KEY = "11baabba2e39d1fe964a6668d8c8c1f6";

const WEATHER_BASE_URL = "http://api.openweathermap.org/data/2.5/weather";

export default function App() {
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [addressData, setAddressData] = useState<any>(null);
  const [loadingAddress, setLoadingAddress] = useState(false);
  const [weatherData, setWeatherData] = useState<any>(null);
  const [loadingWeather, setLoadingWeather] = useState(false);

  const getMyCurrentLocation = async () => {
    setLoading(true);
    setAddressData(null);
    setWeatherData(null);

    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão Negada', 'Ative a permissão de localização.');
      setLoading(false);
      return;
    }

    try {
      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });
      const { latitude: lat, longitude: lon } = location?.coords || {};
      if (lat && lon) {
        setLatitude(lat);
        setLongitude(lon);
        Alert.alert('Sucesso!', 'Coordenadas obtidas.');
      } else {
        Alert.alert('Erro', 'Não foi possível obter as coordenadas.');
      }
    } catch (error) {
      Alert.alert('Erro de GPS', 'Não foi possível obter a localização.');
    } finally {
      setLoading(false);
    }
  };

  const openInGoogleMaps = () => {
    if (!latitude || !longitude) return Alert.alert('Erro', 'Obtenha a localização primeiro.');
    const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    Linking.openURL(url);
  };

  const getReverseGeocoding = async () => {
    if (!latitude || !longitude) return Alert.alert('Atenção', 'Obtenha a localização primeiro.');
    setLoadingAddress(true);
    setAddressData(null);

    try {
      const apiUrl = `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${OPENCAGE_API_KEY}`;
      const response = await fetch(apiUrl);
      const data = await response.json();

      const result = data?.results?.[0];
      if (result) {
        const components = result.components || {};
        const formattedAddress = result.formatted || 'Endereço não encontrado';
        setAddressData({
          address: formattedAddress,
          city: components.city || components.town || components.village || 'N/A',
          state: components.state || 'N/A',
          country: components.country || 'N/A',
          postcode: components.postcode || 'N/A',
          road: components.road || 'N/A',
        });
        Alert.alert('Endereço Encontrado', formattedAddress);
      }
    } catch (error) {
      Alert.alert('Erro de Conexão', 'Não foi possível buscar o endereço.');
    } finally {
      setLoadingAddress(false);
    }
  };

  const getWeatherInfo = async () => {
    if (!latitude || !longitude) return Alert.alert('Atenção', 'Obtenha a localização primeiro.');
    setLoadingWeather(true);
    setWeatherData(null);

    try {
      const url = `${WEATHER_BASE_URL}?lat=${latitude}&lon=${longitude}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=pt`;
      const response = await fetch(url);
      const data = await response.json();

      if (data?.cod === 200) {
        const weatherMain = data.weather?.[0]?.description || 'N/A';
        const temp = data.main?.temp?.toFixed(1) || 'N/A';
        const feelsLike = data.main?.feels_like?.toFixed(1) || 'N/A';
        const humidity = data.main?.humidity || 'N/A';
        const wind = data.wind?.speed?.toFixed(1) || 'N/A';
        const city = data.name || 'N/A';

        setWeatherData({
          main: weatherMain,
          temp,
          feels_like: feelsLike,
          humidity,
          wind,
          city,
        });
      }
    } catch (error) {
      Alert.alert('Erro de Conexão', 'Não foi possível buscar o clima.');
    } finally {
      setLoadingWeather(false);
    }
  };

  const renderButton = (text: string, onPress: () => void, loadingFlag: boolean, disabled: boolean = false) => (
    <TouchableOpacity
      style={[styles.button, (disabled || loadingFlag) && styles.buttonDisabled]}
      onPress={onPress}
      disabled={disabled || loadingFlag}
    >
      {loadingFlag ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>{text}</Text>}
    </TouchableOpacity>
  );

  const renderCard = (title: string, content: string) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Markdown style={markdownStyles}>{content}</Markdown>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>🌍 Projeto Geolocalização</Text>

        {renderButton("1️⃣ Obter Localização", getMyCurrentLocation, loading)}
        {latitude && longitude && (
          <>
            <TouchableOpacity style={styles.mapButton} onPress={openInGoogleMaps}>
              <Text style={styles.mapButtonText}>🗺️ Ver no Google Maps</Text>
            </TouchableOpacity>

            <View style={styles.mapContainer}>
              <WebView
                source={{
                  uri: `https://www.openstreetmap.org/export/embed.html?bbox=${longitude - 0.005}%2C${latitude - 0.005}%2C${longitude + 0.005}%2C${latitude + 0.005}&layer=mapnik&marker=${latitude}%2C${longitude}`
                }}
                style={{ flex: 1, borderRadius: 10 }}
              />
            </View>
          </>
        )}

        {renderButton("2️⃣ Consultar Endereço", getReverseGeocoding, loadingAddress, !latitude)}
        {addressData &&
          renderCard(
            "📍 Endereço Encontrado",
            `
- **Rua:** ${addressData.road}
- **Cidade:** ${addressData.city}
- **Estado:** ${addressData.state}
- **CEP:** ${addressData.postcode}
- **País:** ${addressData.country}
            `
          )}

        {renderButton("3️⃣ Consultar Clima", getWeatherInfo, loadingWeather, !latitude)}
        {weatherData &&
          renderCard(
            `☀️ Clima em ${weatherData.city}`,
            `
- **Descrição:** ${weatherData.main}
- **Temperatura:** ${weatherData.temp}°C
- **Sensação:** ${weatherData.feels_like}°C
- **Humidade:** ${weatherData.humidity}%
- **Vento:** ${weatherData.wind} m/s
            `
          )}
      </ScrollView>
    </SafeAreaView>
  );
}

const markdownStyles = {
  list_item: { fontSize: 15, color: '#333', marginBottom: 5 },
  text: { color: '#333' },
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#005cb3',
    marginBottom: 25,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007aff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginVertical: 8,
    width: '90%',
    alignItems: 'center',
    shadowColor: '#007aff',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonDisabled: {
    backgroundColor: '#9cc6f7',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  mapButton: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#007aff',
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 10,
    width: '90%',
    alignItems: 'center',
  },
  mapButtonText: {
    color: '#007aff',
    fontWeight: '600',
  },
  mapContainer: {
    height: 250,
    width: '100%',
    borderRadius: 10,
    marginTop: 15,
    overflow: 'hidden',
  },
  card: {
    backgroundColor: '#eaf3ff',
    borderRadius: 15,
    padding: 15,
    width: '95%',
    marginTop: 15,
    shadowColor: '#005cb3',
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#005cb3',
    marginBottom: 10,
  },
});
