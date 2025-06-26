import React, { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";

export default function SGWeather() {
  const [forecasts, setForecasts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(
          "https://api.data.gov.sg/v1/environment/2-hour-weather-forecast"
        );
        if (!response.ok) throw new Error("Failed to fetch");
        const data = await response.json();
        if (data.items && data.items.length > 0) {
          setForecasts(data.items[0].forecasts);
        }
      } catch (error) {
        console.error("Error fetching weather:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return <ActivityIndicator size="small" style={{ marginVertical: 10 }} />;
  }

  if (forecasts.length === 0) {
    return (
      <Text style={{ textAlign: "center", marginVertical: 10 }}>
        No forecast data available
      </Text>
    );
  }

  return (
    <View style={{ paddingVertical: 10 }}>
      <Text
        style={{
          fontSize: 18,
          fontWeight: "bold",
          marginBottom: 6,
          textAlign: "center",
        }}
      >
        Singapore 2-Hour Weather Forecast
      </Text>
      {forecasts.map(({ area, forecast }) => (
        <View
          key={area}
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            paddingVertical: 4,
            borderBottomWidth: 0.5,
            borderBottomColor: "#ccc",
          }}
        >
          <Text style={{ fontSize: 14 }}>{area}</Text>
          <Text style={{ fontSize: 14, color: "#555" }}>{forecast}</Text>
        </View>
      ))}
    </View>
  );
}
