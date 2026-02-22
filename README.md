# DroughtLens 🌍

### Ecosystem Drought Response Intelligence Platform
**Multi-Evidence Drought Analysis | PhD Research Project (UNSW Sydney)**

DroughtLens is a comprehensive, research-grade platform developed in Google Earth Engine (GEE) to analyze ecosystem drought responses using multiple lines of evidence. This tool integrates meteorological, hydrological, and ecological indicators to provide a holistic view of drought progression and ecosystem resilience on both continental and local scales.

---

## 🔬 PhD Research Alignment
This platform is specifically designed to address key research themes in ecosystem drought studies:
*   **Topic**: *Analysing ecosystem drought responses using multiple lines of evidence.*
*   **Key Question**: How do different global ecosystems withstand and recover from severe drought events?
*   **Scope**: Supports analysis for all of Australia and selected global biomes (Amazon, Sahel, SE Asia, etc.).

---

## 🚀 Key Features

### 1. Multi-Evidence Indicators
DroughtLens goes beyond standard NDVI monitoring by integrating five distinct data streams:
*   **NDVI Anomaly (z-score)**: Vegetation health deviations (Sentinel-2 / MODIS).
*   **SPI (Standardized Precipitation Index)**: Meteorological drought (CHIRPS).
*   **Soil Moisture Anomaly**: Root-zone water availability (ERA5-Land).
*   **Evapotranspiration (ET) Anomaly**: Carbon/Water flux response proxy (MODIS).
*   **LST Anomaly**: Thermal stress monitoring (MODIS).

### 2. Ecosystem Resilience & Trends
*   **NDVI Recovery Rate**: A custom metric calculating the ratio of post-drought recovery relative to the drought drop.
*   **Sen's Slope Trend**: Long-term vegetation greening/browning analysis.
*   **Rainfall-NDVI Correlation**: Quantifying ecosystem dependency on precipitation.

### 3. Composite Drought Severity Index (CDSI)
A weighted multi-indicator index that combines vegetation health, rainfall, soil moisture, and temperature into a single "multiple lines of evidence" drought map.

### 4. Hybrid Resolution & Scalability
*   **Continental Scale**: Integrated MODIS (500m) support for large regions to ensure memory efficiency.
*   **Local Scale**: Integrated Sentinel-2 (10m) resolution for state-level or custom AOI analysis.
*   **Interactive Drawing**: Custom tool to draw an AOI directly on the map for high-resolution targeted studies.

---

## 🛠️ How to Use

1.  Copy the code from `DroughtLens.js`.
2.  Paste it into the [Google Earth Engine Code Editor](https://code.earthengine.google.com/).
3.  Click **Run**.
4.  Use the UI panel to select your **Region**, **Sensor**, and **Analysis Mode**.
5.  (Optional) Use the **"Draw Custom AOI"** tool to select a specific 10m study area.
6.  Click **"▶ RUN ANALYSIS"** to view results and charts.

---

## 📂 Project Structure
*   `DroughtLens.js`: Main Platform Source Code.
*   `README.md`: Project Documentation.

---

## 🤝 Contact & Research
Developed as part of a research initiative aligned with UNSW Sydney (Water Research Centre).
**Topic**: Ecosystem Drought Response Analysis.
**Supervisors**: Dr. Clare Stephens, Dr. Anna Ukkola, A/Prof Yi Liu.
