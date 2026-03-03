import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  Pressable,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import Svg, { Path, Circle, Defs, LinearGradient, Stop, Text as SvgText, Line } from "react-native-svg";
import type { WorkoutSession } from "./WorkoutCard";
import { getSessionMaxLift, syncMaxLifts } from "../Services/sessionLogApi";

const VISIBLE_POINTS = 10;

interface MaxLiftGraphProps {
  workouts: WorkoutSession[];
  hasMore?: boolean;
  loadMoreWorkouts?: () => void;
}

interface DataPoint {
  sessionId: number;
  date: string;
  label: string;
  maxLift: number;
}

const CHART_HEIGHT = 160;
const LINE_COLOR = "#202c76";
const POINT_RADIUS = 5;
const PADDING = { top: 24, right: 16, bottom: 32, left: 64 };

function formatShortDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString(undefined, {
    month: "short",
  });
}

function formatDateForCallout(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const Y_AXIS_MAX = 700;

function getYAxisTicks(): { ticks: number[]; scaleMax: number } {
  const step = 100;
  const ticks: number[] = [];
  for (let v = 0; v <= Y_AXIS_MAX; v += step) ticks.push(v);
  return { ticks, scaleMax: Y_AXIS_MAX };
}

const MaxLiftGraph: React.FC<MaxLiftGraphProps> = ({
  workouts,
  hasMore = false,
  loadMoreWorkouts,
}) => {
  const [data, setData] = useState<DataPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [synced, setSynced] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const scrollRef = React.useRef<ScrollView>(null);
  const hasScrolledToEnd = React.useRef(false);

  useEffect(() => {
    if (workouts.length === 0) {
      setData([]);
      return;
    }
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        if (!synced) {
          try {
            await syncMaxLifts();
          } catch {
            // Continue without sync - individual fetches will compute if needed
          }
          if (!cancelled) setSynced(true);
        }
        const results = await Promise.all(
          workouts.map(async (w) => {
            if (w.id == null) return null;
            try {
              const res = await getSessionMaxLift(w.id);
              return {
                sessionId: res.sessionId,
                date: w.date ?? "",
                label: formatShortDate(w.date ?? ""),
                maxLift: res.maxLift ?? 0,
              };
            } catch {
              return { sessionId: w.id, date: w.date ?? "", label: formatShortDate(w.date ?? ""), maxLift: 0 };
            }
          })
        );
        const valid = results.filter((r): r is DataPoint => r != null);
        valid.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        if (!cancelled) setData(valid);
      } catch (e) {
        if (!cancelled) setData([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [workouts.length, workouts.map((w) => w.id).join(","), synced]);

  const { width } = Dimensions.get("window");
  const pointCount = data.length;
  // Account for container padding (16*2) + chartWrapper padding (16*2)
  const availableWidth = width - 64;
  const baseChartWidth = availableWidth - PADDING.left - PADDING.right;
  const chartWidth =
    pointCount > 1
      ? baseChartWidth * ((pointCount - 1) / (VISIBLE_POINTS - 1))
      : baseChartWidth;
  const { ticks: yTicks, scaleMax } = useMemo(() => getYAxisTicks(), []);

  const points = useMemo(() => {
    return data.map((point, i) => {
      const x =
        pointCount > 1
          ? PADDING.left + (i / (pointCount - 1)) * chartWidth
          : PADDING.left + chartWidth / 2;
      const barHeight = scaleMax > 0 ? (point.maxLift / scaleMax) * CHART_HEIGHT : 0;
      const y = PADDING.top + CHART_HEIGHT - barHeight;
      return { ...point, x, y };
    });
  }, [data, chartWidth, scaleMax, pointCount]);

  const linePath = useMemo(() => {
    if (points.length === 0) return "";
    const d = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
    return d;
  }, [points]);

  const areaPath = useMemo(() => {
    if (points.length === 0) return "";
    const bottom = PADDING.top + CHART_HEIGHT;
    const line = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
    const last = points[points.length - 1];
    const first = points[0];
    return `${line} L ${last.x} ${bottom} L ${first.x} ${bottom} Z`;
  }, [points]);

  const labelWidth = pointCount > 1 ? chartWidth / (pointCount - 1) : chartWidth;

  const handleChartPress = (e: { nativeEvent: { locationX: number; locationY: number } }) => {
    const { locationX } = e.nativeEvent;
    if (points.length === 0) return;
    let nearest = 0;
    let minDist = Math.abs(points[0].x - locationX);
    for (let i = 1; i < points.length; i++) {
      const d = Math.abs(points[i].x - locationX);
      if (d < minDist) {
        minDist = d;
        nearest = i;
      }
    }
    setSelectedIndex((prev) => (prev === nearest ? null : nearest));
  };

  const selectedPoint = selectedIndex != null ? points[selectedIndex] : null;
  const chartBottom = PADDING.top + CHART_HEIGHT;
  const isScrollable = chartWidth > baseChartWidth;

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!loadMoreWorkouts || !hasMore) return;
    const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
    const threshold = 60;
    if (contentOffset.x < threshold) {
      loadMoreWorkouts();
    }
  };

  const handleContentSizeChange = () => {
    if (isScrollable && !hasScrolledToEnd.current && scrollRef.current) {
      hasScrolledToEnd.current = true;
      scrollRef.current.scrollToEnd({ animated: false });
    }
  };

  if (workouts.length === 0) return null;

  if (loading && data.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Max Lift Over Time</Text>
        <View style={styles.chartPlaceholder}>
          <ActivityIndicator size="small" color="#202c76" />
          <Text style={styles.loadingText}>Loading max lifts...</Text>
        </View>
      </View>
    );
  }

  if (data.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Max Lift Over Time</Text>
        <View style={styles.chartPlaceholder}>
          <Text style={styles.emptyText}>No max lift data yet</Text>
        </View>
      </View>
    );
  }

  const chartContent = (
    <>
      <Pressable onPress={handleChartPress} style={styles.chartPressable}>
        <Svg width={chartWidth + PADDING.left + PADDING.right} height={CHART_HEIGHT + PADDING.top + PADDING.bottom}>
            <Defs>
              <LinearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={LINE_COLOR} stopOpacity="0.2" />
                <Stop offset="1" stopColor={LINE_COLOR} stopOpacity="0" />
              </LinearGradient>
            </Defs>
            {yTicks.map((tick) => {
              const y = PADDING.top + CHART_HEIGHT - (tick / scaleMax) * CHART_HEIGHT;
              return (
                <SvgText
                  key={tick}
                  x={8}
                  y={y}
                  fill="#8a9bb5"
                  fontSize={10}
                  textAnchor="start"
                >
                  {tick} lbs
                </SvgText>
              );
            })}
            <Path d={areaPath} fill="url(#areaGradient)" />
            <Path d={linePath} stroke={LINE_COLOR} strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            {selectedPoint && (
              <Line
                x1={selectedPoint.x}
                y1={selectedPoint.y}
                x2={selectedPoint.x}
                y2={chartBottom}
                stroke={LINE_COLOR}
                strokeWidth={2}
                strokeDasharray="4 4"
              />
            )}
            {points.map((p) => (
              <Circle
                key={p.sessionId}
                cx={p.x}
                cy={p.y}
                r={POINT_RADIUS}
                fill={LINE_COLOR}
                opacity={selectedIndex != null && p.sessionId !== points[selectedIndex].sessionId ? 0.4 : 1}
              />
            ))}
          </Svg>
          {selectedPoint && (
            <View
              style={[
                styles.callout,
                {
                  left: Math.max(8, Math.min(selectedPoint.x - 50, (chartWidth + PADDING.left + PADDING.right) - 108)),
                  top: Math.max(4, selectedPoint.y - 44),
                },
              ]}
              pointerEvents="none"
            >
              <Text style={styles.calloutValue}>{selectedPoint.maxLift} lbs</Text>
              <Text style={styles.calloutDate}>{formatDateForCallout(selectedPoint.date)}</Text>
            </View>
          )}
        </Pressable>
        <View style={[styles.labelsRow, { paddingLeft: PADDING.left, paddingRight: PADDING.right, width: chartWidth + PADDING.left + PADDING.right }]}>
          {data.map((point, i) => (
            <View key={point.sessionId} style={{ width: labelWidth }}>
              <Text style={styles.label} numberOfLines={1}>
                {point.label}
              </Text>
            </View>
          ))}
        </View>
    </>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Max Lift Over Time</Text>
      <View style={styles.chartWrapper}>
        {isScrollable ? (
          <ScrollView
            ref={scrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            onContentSizeChange={handleContentSizeChange}
            scrollEventThrottle={200}
          >
            {chartContent}
          </ScrollView>
        ) : (
          chartContent
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 30,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2a44",
    marginBottom: 12,
  },
  chartWrapper: {
    backgroundColor: "#f4f6fa",
    borderRadius: 12,
    padding: 16,
    paddingBottom: 8,
    overflow: "visible",
  },
  chartPlaceholder: {
    height: CHART_HEIGHT + 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f4f6fa",
    borderRadius: 12,
  },
  loadingText: {
    fontSize: 14,
    color: "#51607a",
    marginTop: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#51607a",
  },
  labelsRow: {
    flexDirection: "row",
    marginTop: 8,
  },
  label: {
    fontSize: 10,
    color: "#51607a",
    textAlign: "center",
  },
  chartPressable: {
    position: "relative",
  },
  callout: {
    position: "absolute",
    width: 100,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: "#1f2a44",
    borderRadius: 8,
    alignItems: "center",
  },
  calloutValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  calloutDate: {
    fontSize: 11,
    color: "#b8c4d8",
    marginTop: 2,
  },
});

export default MaxLiftGraph;
