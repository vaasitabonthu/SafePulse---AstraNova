import { Picker } from "@react-native-picker/picker";
import * as Location from "expo-location";
import React, { useContext, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { HistoryContext } from "../../context/HistoryContext";

export default function MonitorScreen() {
  const [name, setName] = useState("");
  const [workType, setWorkType] = useState("Construction");
  const [hours, setHours] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [riskScore, setRiskScore] = useState<number | null>(null);
  const [temperature, setTemperature] = useState<number | null>(null);
  const [aqi, setAqi] = useState<number | null>(null);
  const [riskReasons, setRiskReasons] = useState<string[]>([]);
  const { history, setHistory } = useContext(HistoryContext);
  const [loading, setLoading] = useState(false);

  const calculateRisk = async () => {
    let score = 0;
    let reasons: string[] = [];
    let temp: number | null = null;
    let aqiValue: number | null = null;

    if (!hours) {
      Alert.alert("Error", "Please enter work hours");
      return;
    }

    setLoading(true);
    const workHours = parseInt(hours);

    if (workType === "Construction") {
      score += 20;
      reasons.push("High-risk work type");
    }

    if (workType === "Factory") {
      score += 15;
      reasons.push("Industrial exposure");
    }

    if (workHours > 8 && workHours <= 12) {
      score += 30;
      reasons.push("Extended work hours");
    }

    if (workHours > 12 && workHours <= 16) {
      score += 50;
      reasons.push("Excessive work hours");
    }

    if (workHours > 16) {
      score += 70;
      reasons.push("Extreme work duration");
    }

    if (symptoms.toLowerCase().includes("dizziness")) {
      score += 20;
      reasons.push("Dizziness reported");
    }

    if (symptoms.toLowerCase().includes("fatigue")) {
      score += 15;
      reasons.push("Fatigue reported");
    }

    if (symptoms.toLowerCase().includes("previous diseases")) {
      score += 35;
      reasons.push("Disease reported");
    }

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        Alert.alert("Location permission required");
        setLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      const API_KEY = "8eca01d0ffa6620e8d19b16f7ca750e7";

      // Weather
      const weatherRes = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
      );

      const weatherData = await weatherRes.json();

      if (weatherData.cod === 200) {
        temp = weatherData.main?.temp ?? null;
        setTemperature(temp);

        if (temp && temp > 35) {
          score += 25;
          reasons.push("High temperature exposure");
        }
      }

      // AQI
      const aqiRes = await fetch(
        `https://api.openweathermap.org/data/2.5/air_pollution?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`
      );

      const aqiData = await aqiRes.json();

      if (aqiData.list) {
        aqiValue = aqiData.list[0]?.main?.aqi ?? null;
        setAqi(aqiValue);

        if (aqiValue && aqiValue >= 4) {
          score += 25;
          reasons.push("Poor air quality");
        }
      }
    } catch (error) {
      console.log("API Error:", error);
    }

    setRiskScore(score);
    setRiskReasons(reasons);

    const newEntry = {
      name,
      score,
      temperature: temp,
      aqi: aqiValue,
      time: new Date().toLocaleTimeString(),
    };

    setHistory((prev: any[]) => [newEntry, ...prev]);
    setLoading(false);
  };

  const clearHistory = () => {
    setHistory([]);
  };

  const getRiskLevel = () => {
    if (riskScore === null) return "";
    if (riskScore < 40) return "Low Risk";
    if (riskScore < 70) return "Moderate Risk";
    return "High Risk";
  };

  const getRiskColor = () => {
    if (riskScore === null) return "white";
    if (riskScore < 40) return "green";
    if (riskScore < 70) return "orange";
    return "red";
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Worker Monitoring</Text>

      <TextInput
        placeholder="Worker Name"
        placeholderTextColor="#aaa"
        style={styles.input}
        value={name}
        onChangeText={setName}
      />

      <Picker
        selectedValue={workType}
        style={styles.input}
        onValueChange={(itemValue) => setWorkType(itemValue)}
      >
        <Picker.Item label="Construction" value="Construction" />
        <Picker.Item label="Factory" value="Factory" />
        <Picker.Item label="Agriculture" value="Agriculture" />
        <Picker.Item label="Street Vendor" value="Street Vendor" />
      </Picker>

      <TextInput
        placeholder="Work Hours"
        placeholderTextColor="#aaa"
        style={styles.input}
        keyboardType="numeric"
        value={hours}
        onChangeText={setHours}
      />

      <TextInput
        placeholder="Symptoms"
        placeholderTextColor="#aaa"
        style={styles.input}
        value={symptoms}
        onChangeText={setSymptoms}
      />

      <TouchableOpacity
        style={[styles.button, loading && { opacity: 0.6 }]}
        onPress={calculateRisk}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#0A1F44" />
        ) : (
          <Text style={styles.buttonText}>Calculate Risk</Text>
        )}
      </TouchableOpacity>

      {riskScore !== null && (
        <>
          <Text style={[styles.result, { color: getRiskColor() }]}>
            Risk Level: {getRiskLevel()} ({riskScore}%)
          </Text>

          {temperature !== null && (
            <Text style={styles.reason}>
              🌡 Temperature: {temperature}°C
            </Text>
          )}

          {aqi !== null && (
            <Text style={styles.reason}>
              🌫 AQI Level: {aqi}
            </Text>
          )}

          {riskReasons.map((reason, index) => (
            <Text key={index} style={styles.reason}>
              • {reason}
            </Text>
          ))}
        </>
      )}

      {history.length > 0 && (
        <>
          <Text style={styles.historyTitle}>Risk History</Text>

          {history.map((item: any, index: number) => (
            <View key={index} style={styles.historyCard}>
              <Text style={{ color: "white" }}>
                {item.name} - {item.score}%
              </Text>
              <Text style={{ color: "#00D4FF", fontSize: 12 }}>
                Temp: {item.temperature ?? "N/A"}°C | AQI:{" "}
                {item.aqi ?? "N/A"}
              </Text>
              <Text style={{ color: "#ccc", fontSize: 11 }}>
                {item.time}
              </Text>
            </View>
          ))}

          <TouchableOpacity style={styles.clearBtn} onPress={clearHistory}>
            <Text style={{ color: "white" }}>Clear History</Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#0A1F44",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    backgroundColor: "#1E2A5A",
    color: "white",
    marginBottom: 15,
    padding: 10,
    borderRadius: 8,
  },
  button: {
    backgroundColor: "#00D4FF",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#0A1F44",
    fontWeight: "bold",
  },
  result: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  reason: {
    color: "#ccc",
    marginTop: 5,
    textAlign: "center",
  },
  historyTitle: {
    marginTop: 20,
    color: "white",
    fontWeight: "bold",
  },
  historyCard: {
    backgroundColor: "#1E2A5A",
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  clearBtn: {
    marginTop: 10,
    backgroundColor: "red",
    padding: 8,
    borderRadius: 6,
    alignItems: "center",
  },
});