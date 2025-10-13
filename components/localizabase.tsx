import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, Alert, Linking, ScrollView, Dimensions } from 'react-native';
import * as Location from 'expo-location';
import Markdown from 'react-native-markdown-display';
import { WebView } from 'react-native-webview';

const OPENCAGE_API_KEY = "668cb7b6a52a4d15a8de3f131d23ab51";
const OPENWEATHER_API_KEY = "11baabba2e39d1fe964a6668d8c8c1f6";
const WEATHER_BASE_URL = "http://api.openweathermap.org/data/2.5/weather";

export default function App() {
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

    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão Negada', 'Ative a permissão de localização.');
      setLoading(false);
      return;
    }

    try {
      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });
      setLatitude(location.coords.latitude);
      setLongitude(location.coords.longitude);
      Alert.alert('Sucesso!', 'Coordenadas obtidas.');
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
      if (data.results.length > 0) {
        const components = data.results[0].components;
        const formattedAddress = data.results[0].formatted;
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
      if (data.cod === 200) {
        setWeatherData({
          main: data.weather[0].description,
          temp: data.main.temp.toFixed(1),
          feels_like: data.main.feels_like.toFixed(1),
          humidity: data.main.humidity,
          wind: data.wind.speed.toFixed(1),
          city: data.name,
        });
        Alert.alert('Clima Encontrado', `Temperatura: ${data.main.temp.toFixed(1)}°C em ${data.name}`);
      }
    } catch (error) {
      Alert.alert('Erro de Conexão', 'Não foi possível buscar o clima.');
    } finally {
      setLoadingWeather(false);
    }
  };

  const renderAddressDetails = () => {
    if (!addressData) return null;
    const markdownContent = `
# Endereço:
- **Rua:** ${addressData.road}
- **Cidade:** ${addressData.city}
- **Estado:** ${addressData.state}
- **CEP:** ${addressData.postcode}
- **País:** ${addressData.country}
    `;
    return <Markdown style={markdownStyles}>{markdownContent}</Markdown>;
  };

  const renderWeatherDetails = () => {
    if (!weatherData) return null;
    const markdownContent = `
# Clima Atual em ${weatherData.city}:
- **Descrição:** ${weatherData.main}
- **Temperatura:** ${weatherData.temp}°C
- **Sensação Térmica:** ${weatherData.feels_like}°C
- **Humidade:** ${weatherData.humidity}%
- **Vento:** ${weatherData.wind} m/s
    `;
    return <Markdown style={markdownStyles}>{markdownContent}</Markdown>;
  };

  return (
    <ScrollView style={{ flex: 1, padding: 20, backgroundColor: '#f0f4f7' }}>
      <Text style={styles.title}>Projeto Geolocalização</Text>

      <Button title={loading ? "Buscando..." : "1. PEGAR MINHA LOCALIZAÇÃO"} onPress={getMyCurrentLocation} disabled={loading} />

      {latitude && longitude && (
        <>
          <Button title="Ver no Google Maps" color="#4285F4" onPress={openInGoogleMaps} style={{ marginTop: 10 }} />

          <View style={{ height: 300, marginTop: 15 }}>
            <WebView
              source={{
                uri: `https://www.openstreetmap.org/export/embed.html?bbox=${longitude-0.005}%2C${latitude-0.005}%2C${longitude+0.005}%2C${latitude+0.005}&layer=mapnik&marker=${latitude}%2C${longitude}`
              }}
              style={{ flex: 1 }}
            />
          </View>
        </>
      )}

      <View style={{ marginTop: 20 }}>
        <Button title={loadingAddress ? "Buscando Endereço..." : "2. CONSULTAR ENDEREÇO"} onPress={getReverseGeocoding} disabled={!latitude || loadingAddress} />
        {renderAddressDetails()}

        <View style={{ marginTop: 20 }}>
          <Button title={loadingWeather ? "Buscando Clima..." : "3. CONSULTAR CLIMA"} onPress={getWeatherInfo} disabled={!latitude || loadingWeather} />
          {renderWeatherDetails()}
        </View>
      </View>
    </ScrollView>
  );
}

const markdownStyles = {
  heading1: { fontSize: 18, fontWeight: 'bold', color: '#005cb3', marginBottom: 5 },
  list_item: { fontSize: 14, color: '#333', marginBottom: 4 },
};

const styles = {
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: '#333' },
};
