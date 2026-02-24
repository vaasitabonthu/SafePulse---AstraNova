import React, { useContext } from "react";
import { Dimensions, ScrollView, StyleSheet, Text, View } from "react-native";
import { HistoryContext } from "../context/HistoryContext";

const screenWidth = Dimensions.get("window").width;

export default function SupervisorScreen() {
  const context = useContext(HistoryContext);
  const history = context?.history ?? [];

  const totalRecords = history.length;

  const highRiskCases = history.filter((i: any) => i.score >= 70).length;
  const moderateRiskCases = history.filter(
    (i: any) => i.score >= 40 && i.score < 70
  ).length;
  const lowRiskCases = history.filter((i: any) => i.score < 40).length;

  const averageRisk =
    totalRecords > 0
      ? Math.round(
          history.reduce((sum: number, i: any) => sum + i.score, 0) /
            totalRecords
        )
      : 0;

  /* ---------- SMART SUMMARY ---------- */
  let smartSummary = "No monitoring data available yet.";

  if (history.length > 0) {
    const highPct = Math.round((highRiskCases / totalRecords) * 100);
    const modPct = Math.round((moderateRiskCases / totalRecords) * 100);

    smartSummary = `From ${totalRecords} records, ${highPct}% workers are high-risk and ${modPct}% are moderate-risk. `;

    if (averageRisk >= 70) {
      smartSummary += "Overall workforce condition is CRITICAL.";
    } else if (averageRisk >= 40) {
      smartSummary += "Workforce risk is MODERATE. Preventive action advised.";
    } else {
      smartSummary += "Workforce condition is STABLE.";
    }
  }

  /* ---------- BAR DATA ---------- */
  const chartData = {
    labels: ["1", "2", "3"],
    datasets: [
      {
        data: [20, 45, 60],
      },
    ],
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Supervisor Dashboard</Text>

      {/* SUMMARY */}
      <View style={styles.card}>
        <Text style={styles.text}>Total Records: {totalRecords}</Text>
        <Text style={styles.text}>Average Risk: {averageRisk}%</Text>
      </View>

      {/* DISTRIBUTION */}
      <View style={styles.card}>
        <Text style={styles.low}>🟢 Low Risk: {lowRiskCases}</Text>
        <Text style={styles.moderate}>
          🟠 Moderate Risk: {moderateRiskCases}
        </Text>
        <Text style={styles.high}>🔴 High Risk: {highRiskCases}</Text>
      </View>

      {highRiskCases > 0 && (
        <Text style={styles.alert}>⚠ Immediate Attention Required</Text>
      )}

      {/* SMART ANALYSIS */}
      <View style={styles.aiCard}>
        <Text style={styles.sectionTitle}>Smart Risk Analysis</Text>
        <Text style={styles.aiText}>{smartSummary}</Text>
      </View>


        <Text style={styles.sectionTitle}>Risk Trend (Last 5)</Text>

<View style={styles.chartContainer}>
  {history.slice(0, 5).map((item: any, index: number) => {
    const height = (item.score / 100) * 150;

    return (
      <View key={index} style={styles.barWrapper}>
        <View
          style={[
            styles.bar,
            {
              height: height,
              backgroundColor:
                item.score >= 70
                  ? "red"
                  : item.score >= 40
                  ? "orange"
                  : "green",
            },
          ]}
        />
        <Text style={styles.barLabel}>{item.score}%</Text>
      </View>
    );
  })}
</View>

      {/* HISTORY */}
      {history.map((item: any, index: number) => (
        <View key={index} style={styles.historyCard}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.high}>Risk: {item.score}%</Text>
          <Text style={styles.meta}>
            Temp: {item.temperature ?? "N/A"}°C | AQI:{" "}
            {item.aqi ?? "N/A"}
          </Text>
          <Text style={styles.time}>{item.time}</Text>
        </View>
      ))}
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
  card: {
    backgroundColor: "#1E2A5A",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  text: {
    color: "white",
    fontSize: 16,
  },
  low: { color: "lightgreen" },
  moderate: { color: "orange" },
  high: { color: "red" },
  alert: {
    color: "red",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  sectionTitle: {
    color: "white",
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 5,
  },
  historyCard: {
    backgroundColor: "#1E2A5A",
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  name: {
    color: "white",
    fontWeight: "bold",
  },
  meta: {
    color: "#00D4FF",
    fontSize: 12,
  },
  time: {
    color: "#ccc",
    fontSize: 11,
  },
  aiCard: {
    backgroundColor: "#111B3C",
    padding: 15,
    borderRadius: 10,
    marginTop: 15,
  },
  aiText: {
    color: "#FFD700",
    fontSize: 14,
    lineHeight: 20,
  },
  chartContainer: {
  flexDirection: "row",
  alignItems: "flex-end",
  justifyContent: "space-around",
  height: 180,
  marginVertical: 15,
},

barWrapper: {
  alignItems: "center",
},

bar: {
  width: 30,
  borderRadius: 6,
},

barLabel: {
  color: "white",
  marginTop: 5,
  fontSize: 12,
},
});