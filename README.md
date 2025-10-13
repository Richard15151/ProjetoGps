# 🌦️ Localização, Endereço e Clima - React Native (Expo)

Este projeto é um aplicativo **React Native com Expo** que utiliza o **GPS do dispositivo** para obter a localização atual do usuário, converter coordenadas geográficas em **endereço completo** e buscar informações **meteorológicas em tempo real** (como temperatura e condições climáticas).

---

## 🧭 Funcionalidades

✅ Obter coordenadas de latitude e longitude com `expo-location`  
✅ Converter coordenadas em endereço usando a API **OpenCage Geocoding**  
✅ Buscar informações de clima com a API **OpenWeather**  
✅ Exibir os dados de forma organizada e amigável na tela  
✅ Interface adaptada para áreas seguras com `SafeAreaView`  
✅ Estilo limpo e moderno com destaque em azul  

---

## 🧰 Tecnologias Utilizadas

| Tecnologia | Função |
|-------------|---------|
| **React Native (Expo)** | Estrutura base do aplicativo mobile |
| **expo-location** | Obtenção de localização GPS |
| **OpenCage API** | Conversão de coordenadas → endereço humano |
| **OpenWeather API** | Dados meteorológicos em tempo real |
| **SafeAreaView** | Garante que o conteúdo fique visível fora da área da câmera frontal |
| **Tailwind CSS (opcional)** | Estilização moderna e responsiva |

---

## ⚙️ Instalação e Configuração

### 1. Clonar o projeto

```bash
git clone https://github.com/usuario/projeto-clima.git
cd projeto-clima
```

### 2. Instalar dependências

```bash
npm install
```

### 3. Criar as chaves de API no `Localizacao.tsx`

No arquivo Localizacao, coloque suas chaves de API:

```
OPENCAGE_API_KEY=SuaChaveAqui
OPENWEATHER_API_KEY=SuaChaveAqui
```

### 4. Executar o projeto

```bash
npx expo start
```

---

## 🧠 Explicação das Principais Funções

### 📍 Obtenção da Localização
```js
import * as Location from 'expo-location';

const location = await Location.getCurrentPositionAsync({});
setLatitude(location.coords.latitude);
setLongitude(location.coords.longitude);
```
Obtém a **latitude** e **longitude** atuais do dispositivo utilizando o GPS.

---

### 🌎 Conversão de Coordenadas em Endereço
```js
const apiUrl = `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${OPENCAGE_API_KEY}`;
```
A função faz uma requisição à **OpenCage API**, que converte as coordenadas em um **endereço formatado** (rua, bairro, cidade, país).

---

### ☁️ Consulta de Clima Atual
```js
const weatherUrl = `http://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=pt`;
```
A função envia a latitude e longitude para a **OpenWeather API**, que retorna dados como:

- Temperatura atual  
- Descrição do tempo (ex: “céu limpo”)  
- Umidade, pressão, e velocidade do vento  

---

### 🧱 SafeAreaView
```js
import { SafeAreaView } from 'react-native';
```
Garante que o conteúdo **não fique escondido** atrás da câmera frontal, notch ou barra superior do celular.

---

### 🎨 Estilização
A interface foi projetada com:
- Fundo branco  
- Detalhes e botões em azul  
- Textos grandes e legíveis  
- Resultados exibidos de forma organizada  

---

## 🚀 Melhorias Futuras

- Adicionar ícones meteorológicos (sol, chuva, nuvens etc.)  
- Exibir mapa com o local atual usando `react-native-maps`  
- Modo escuro (Dark Mode)  
- Exibir previsão para os próximos dias  

---

## 👨‍💻 Autores

- Richard de Oliveira Ribeiro - https://github.com/Richard15151
- Matheus Wincler Santos - https://github.com/MathWincler

---
