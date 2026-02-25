import * as Location from "expo-location";
import React, { useContext, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { HistoryContext } from "../../context/HistoryContext";

export default function HospitalsScreen() {
  const [places, setPlaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const { history } = useContext(HistoryContext);
  const latestRisk = history.length > 0 ? history[0].score : 0;

  useEffect(() => {
    fetchNearby();
  }, []);

  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(2);
  };

  const fetchNearby = async () => {
    try {
      const { status } =
        await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        alert("Location permission required");
        setLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      const query = `
        [out:json][timeout:25];
        (
          node["amenity"~"hospital|clinic|pharmacy"](around:10000,${latitude},${longitude});
          way["amenity"~"hospital|clinic|pharmacy"](around:10000,${latitude},${longitude});
          relation["amenity"~"hospital|clinic|pharmacy"](around:10000,${latitude},${longitude});
        );
        out center;
      `;

      const url =
        "https://overpass-api.de/api/interpreter?data=" +
        encodeURIComponent(query);

      const response = await fetch(url);
      const text = await response.text();

      if (!text.startsWith("{")) {
        console.log("Overpass blocked");
        setLoading(false);
        return;
      }

      const data = JSON.parse(text);

      const enrichedPlaces = (data.elements || [])
        .map((place: any) => {
          const lat = place.lat || place.center?.lat;
          const lon = place.lon || place.center?.lon;

          if (!lat || !lon) return null;

          const distance = calculateDistance(
            latitude,
            longitude,
            lat,
            lon
          );

          return { ...place, lat, lon, distance };
        })
        .filter(Boolean);

      enrichedPlaces.sort(
        (a: any, b: any) =>
          parseFloat(a.distance) - parseFloat(b.distance)
      );

      setPlaces(enrichedPlaces);
      setLoading(false);
    } catch (error) {
      console.log("Overpass Error:", error);
      setLoading(false);
    }
  };

  const openInMaps = (lat: number, lon: number) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;
    Linking.openURL(url);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="blue" />
        <Text>Finding nearby medical facilities...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {latestRisk >= 70 && (
        <>
          <View style={styles.emergencyBanner}>
            <Text style={styles.emergencyText}>
              🚨 HIGH RISK DETECTED — SEEK IMMEDIATE MEDICAL SUPPORT
            </Text>
          </View>

          <TouchableOpacity
            style={styles.emergencyCall}
            onPress={() => Linking.openURL("tel:108")}
          >
            <Text style={styles.emergencyCallText}>
              📞 Call Emergency (108)
            </Text>
          </TouchableOpacity>
        </>
      )}

      <Text style={styles.title}>Nearby Medical Support</Text>

      {places.length === 0 && (
        <Text style={{ textAlign: "center", marginTop: 20 }}>
          ⚠ Unable to fetch nearby hospitals.
        </Text>
      )}

      {places.map((place, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.card,
            index === 0 && styles.nearestCard,
          ]}
          onPress={() => openInMaps(place.lat, place.lon)}
        >
          <Text style={styles.name}>
            {index === 0 ? "⭐ Nearest: " : ""}
            {place.tags?.name || "Unnamed Facility"}
          </Text>

          <Text style={styles.type}>
            Type: {place.tags?.amenity}
          </Text>

          <Text style={styles.distance}>
            📍 {place.distance} KM away
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#F5F5F5",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
  },
  card: {
    backgroundColor: "#E3F2FD",
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
  },
  nearestCard: {
    borderWidth: 2,
    borderColor: "green",
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
  },
  type: {
    color: "gray",
    marginTop: 4,
  },
  distance: {
    color: "#007AFF",
    marginTop: 6,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emergencyBanner: {
    backgroundColor: "red",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  emergencyText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  emergencyCall: {
    backgroundColor: "#8B0000",
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: "center",
  },
  emergencyCallText: {
    color: "white",
    fontWeight: "bold",
  },
});