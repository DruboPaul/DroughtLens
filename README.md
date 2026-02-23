# DroughtLens 🌍

### Ecosystem Drought Response Intelligence Platform
**Multi-Evidence Drought Analysis | Ecosystem Drought Response Platform**

DroughtLens is a comprehensive, research-grade platform developed in Google Earth Engine (GEE) to analyze ecosystem drought responses using multiple lines of evidence. This tool integrates meteorological, hydrological, and ecological indicators to provide a holistic view of drought progression and ecosystem resilience on both continental and local scales.

---

## 🔬 PhD Research Alignment
This platform is specifically designed to address key research themes in ecosystem drought studies:
*   **Topic**: *Analysing ecosystem drought responses using multiple lines of evidence.*
*   **Key Question**: How do different global ecosystems withstand and recover from severe drought events?
*   **Scope**: Supports analysis for all of Australia and selected global biomes (Amazon, Sahel, SE Asia, etc.).

---

---

## 🧪 Scientific Methodology

DroughtLens utilizes a multi-sensor, multi-temporal approach to quantify environmental stress:

### 1. Anomaly Mapping (z-score)
Environmental indicators (NDVI, SM, ET, LST) are calculated as standard anomalies:
$$z = \frac{(x - \mu)}{\sigma}$$
Where $x$ is the target year mean, $\mu$ is the historical baseline (2001-2022) mean, and $\sigma$ is the standard deviation. This normalizes the data, allowing for direct comparison across different biomes.

### 2. Composite Drought Severity Index (CDSI)
A weighted integration of multiple environmental stressors to reduce uncertainty in drought detection:
**$CDSI = (0.30 \times NDVI_{anom}) + (0.25 \times SPI) + (0.25 \times SM_{anom}) - (0.20 \times LST_{anom})$**

### 3. Ecosystem Resilience (Recovery Rate)
Calculated as the ratio of post-drought greenness recovery relative to the drought-induced deficit. High values indicate strong ecosystem elasticity and rapid recovery post-stress.

---

## 📊 Data Sources

| Indicator | Dataset Source | Resolution | Time Scale |
| :--- | :--- | :--- | :--- |
| **Vegetation (NDVI)** | MODIS (MOD13A1) / Sentinel-2 | 500m / 10m | 16-Day / 5-Day |
| **Precipitation** | CHIRPS Daily | 5.5 km | Daily |
| **Soil Moisture** | ERA5-Land Monthly | 11 km | Monthly |
| **Surface Temp** | MODIS (MOD11A2) | 1 km | 8-Day |
| **Evapotranspiration**| MODIS (MOD16A2) | 500m | 8-Day |
| **Surface Water** | Sentinel-1 SAR | 10m | 12-Day |

---

## 🚀 Key Features

### 1. Multi-Evidence Indicators
DroughtLens goes beyond standard NDVI monitoring by integrating distinct data streams to provide a holistic ecosystem perspective:
*   **NDVI Anomaly**: Vegetation health deviations.
*   **SPI (Standardized Precipitation Index)**: Meterological drought intensity.
*   **Soil Moisture Anomaly**: Root-zone water availability from reanalysis data.
*   **Evapotranspiration (ET) Anomaly**: Proxy for ecosystem water-use efficiency and carbon flux.
*   **LST Anomaly**: Detection of thermal stress and heatwave impacts on canopy cover.

### 2. Ecosystem Resilience & Trends
*   **NDVI Recovery Rate**: Quantification of post-perturbation recovery dynamics.
*   **Sen's Slope Trend**: Non-parametric trend analysis for long-term greening/browning.
*   **Rainfall-NDVI Correlation**: Pixel-wise Pearson correlation to map vegetation-rainfall coupling.
    *   *Interpretation*: 
        *   **High (Green)**: Ecosystem is strongly rain-dependent (e.g., healthy grasslands).
        *   **Low (Red)**: Potential "Ecosystem Burnout." Vegetation is failing to respond to rain due to extreme drought stress, land degradation, or a shift to groundwater dependency.

### 3. SAR Water Explorer
*   **SAR Monthly Water**: Radar detection of surface water bodies, unaffected by clouds.
*   **SAR Monthly View**: Target specific months to analyze seasonal flooding or drying.
*   **SAR Total Occurrence**: Frequency-based water mapping (0-12 months) to distinguish permanent water from ephemeral flooding.

### 4. Hybrid Resolution & Scalability
*   **Continental Scale**: Adaptive MODIS (500m) processing for efficient Australia-wide mapping.
*   **Local Scale**: High-resolution Sentinel-2 and Sentinel-1 (10m) analysis for targeted sites or custom AOIs.

### 5. Automated Scientific Insights
*   **Real-time Interpretation**: Dynamic interpretation panel providing plain-language scientific context for all 13 analysis modes.
*   **PhD Guidance**: Helps researchers and policy-makers understand the ecological significance of the mapped anomalies.

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

## 🤝 Contact
For inquiries or collaborations regarding this platform, please reach out via GitHub.
