/************************************************************
 DROUGHTLENS — Ecosystem Drought Response Intelligence Platform
 Multi-Evidence Drought Analysis | PhD Research Project (UNSW Sydney)
 
 Academic Reference Style Implementation (Inspired by Hansen et al. 2013)
 ************************************************************/

/* =========================================================
   1️⃣ DRAWING TOOLS & REGION SETUP
========================================================= */

var drawingTools = Map.drawingTools();
drawingTools.setShown(false);
drawingTools.setLinked(false);
drawingTools.setDrawModes(['polygon']);
drawingTools.addLayer([], 'AOI', 'red');

var auStates = ee.FeatureCollection("FAO/GAUL/2015/level1")
    .filter(ee.Filter.eq('ADM0_NAME', 'Australia'));

var stateNames = auStates.aggregate_array('ADM1_NAME').sort();
stateNames = ee.List([
    '── Custom AOI ──',
    'Use Drawn Polygon',
    '── Australia ──',
    'Whole Australia'
]).cat(stateNames).cat(ee.List([
    '── Global Biomes ──',
    'Amazon Basin',
    'Sahel (West Africa)',
    'Southern Africa',
    'Indian Subcontinent',
    'Southeast Asia',
    'Mediterranean Europe'
]));

/* Global region bounding boxes */
var globalRegions = {
    'Amazon Basin': ee.Geometry.Rectangle([-75, -15, -45, 5]),
    'Sahel (West Africa)': ee.Geometry.Rectangle([-18, 10, 25, 20]),
    'Southern Africa': ee.Geometry.Rectangle([15, -35, 40, -10]),
    'Indian Subcontinent': ee.Geometry.Rectangle([68, 6, 97, 36]),
    'Southeast Asia': ee.Geometry.Rectangle([95, -10, 140, 25]),
    'Mediterranean Europe': ee.Geometry.Rectangle([-10, 30, 40, 48])
};

var auBounds = ee.Geometry.Rectangle([112, -44, 154, -10]);

/* =========================================================
   2️⃣ UI DESIGN & STYLING
========================================================= */

var panel = ui.Panel({
    style: { width: '400px', padding: '15px', backgroundColor: 'white' }
});

// App Title (Hansen Style: Thick Red Title)
panel.add(ui.Label('DroughtLens',
    { fontSize: '30px', fontWeight: 'bold', color: '#d32f2f', margin: '0 0 5px 0' }));

panel.add(ui.Label('Ecosystem Drought Response Platform',
    { fontSize: '14px', fontWeight: 'bold', margin: '0 0 10px 0' }));

panel.add(ui.Label('Results from analysis of multi-evidence environmental data characterizing ecosystem stress and resilience.',
    { fontSize: '12px', color: '#444', margin: '0 0 10px 0' }));


panel.add(ui.Label('View Different Layers', { fontSize: '18px', fontWeight: 'bold', margin: '15px 0 5px 0' }));

/* --- Inputs Section --- */
panel.add(ui.Label('Select Region', { fontSize: '11px', fontWeight: 'bold', color: '#212121' }));
var regionSelect = ui.Select({
    items: stateNames.getInfo(),
    value: 'Whole Australia',
    style: { width: '100%', margin: '0 0 10px 0' }
});
panel.add(regionSelect);

var aoiBtn = ui.Button({
    label: '✏️ Draw Custom AOI (Polygon)',
    onClick: function () {
        drawingTools.setShown(true);
        // Clear previous geometries to start fresh
        var layer = drawingTools.layers().get(0);
        layer.geometries().reset();
        layer.setShown(true); // Ensure it's visible while drawing

        // Specifically set the mode to polygon drawing
        drawingTools.setShape('polygon');
        drawingTools.draw();
        regionSelect.setValue('Use Drawn Polygon');
        print('✏️ Drawing mode activated: Click on the map to define your area. Double-click to finish.');
    },
    style: { width: '100%', margin: '-5px 0 15px 0' }
});
panel.add(aoiBtn);

panel.add(ui.Label('Analysis Year', { fontSize: '11px', fontWeight: 'bold', color: '#212121' }));
var yearSelect = ui.Select({
    items: ['2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024'],
    value: '2023',
    style: { width: '100%' }
});
panel.add(yearSelect);

panel.add(ui.Label('Baseline Range (Start - End)', { fontSize: '11px', fontWeight: 'bold', color: '#212121', margin: '10px 0 0 0' }));
var basePanel = ui.Panel({
    layout: ui.Panel.Layout.flow('horizontal'),
    style: { width: '100%', margin: '0 0 10px 0' }
});

var baseStartSelect = ui.Select({
    items: ['2000', '2001', '2002', '2003', '2004', '2005', '2010', '2015'],
    value: '2000',
    style: { width: '48%' }
});

var baseEndSelect = ui.Select({
    items: ['2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022'],
    value: '2020',
    style: { width: '48%' }
});

basePanel.add(baseStartSelect);
basePanel.add(baseEndSelect);
panel.add(basePanel);

panel.add(ui.Label('Select Month (for Monthly View)', { fontSize: '11px', fontWeight: 'bold', color: '#212121', margin: '10px 0 0 0' }));
var monthSelect = ui.Select({
    items: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    value: 'January',
    style: { width: '100%' }
});
panel.add(monthSelect);

panel.add(ui.Label('Select Analysis Mode', { fontSize: '11px', fontWeight: 'bold', color: '#212121', margin: '10px 0 0 0' }));
var modeSelect = ui.Select({
    items: [
        '── Drought Indicators ──',
        'NDVI Drought Anomaly',
        'SPI (Precip Index)',
        'Soil Moisture Anomaly',
        'ET Anomaly (Evapotranspiration)',
        'LST Anomaly (Surface Temp)',
        '── Correlation & Trend ──',
        'Rainfall-NDVI Correlation',
        'Vegetation Trend (Sen Slope)',
        'NDVI Recovery Rate (Resilience)',
        '── Composite ──',
        'Composite Drought Severity (CDSI)',
        '── SAR Water ──',
        'SAR Monthly Water (Annual Mean)',
        'SAR Monthly View (Single Month)',
        'SAR Total Occurrence (Frequency)',
        'SAR Change Intensity'
    ],
    value: 'NDVI Drought Anomaly',
    style: { width: '100%' }
});
panel.add(modeSelect);

panel.add(ui.Label('Resolution / Sensor', { fontSize: '11px', fontWeight: 'bold', color: '#212121', margin: '10px 0 0 0' }));
var sensorSelect = ui.Select({
    items: [
        'MODIS (500m) — Large Area',
        'Sentinel-2 (10m) — Small Area'
    ],
    value: 'MODIS (500m) — Large Area',
    style: { width: '100%' }
});
panel.add(sensorSelect);

/* --- Run Button Section --- */
var runButton = ui.Button({
    label: '▶  RUN ANALYSIS',
    style: {
        width: '100%',
        margin: '20px 0',
        fontWeight: 'bold',
        color: '#1B5E20' // Dark Green text for high visibility
    }
});
panel.add(runButton);

/* --- Legend Area (Hansen Style) --- */
var legendPanel = ui.Panel({
    style: { border: '1px solid #ddd', padding: '8px', margin: '10px 0' }
});
panel.add(ui.Label('Legend', { fontWeight: 'bold' }));
panel.add(legendPanel);

/* --- Opacity Slider --- */
var opacityRow = ui.Panel({ layout: ui.Panel.Layout.flow('horizontal') });
opacityRow.add(ui.Label('Opacity:', { fontSize: '12px', margin: '8px 4px 0 0' }));
var opacitySlider = ui.Slider({
    min: 0, max: 1, value: 1, step: 0.1,
    style: { width: '200px' },
    onChange: function (val) {
        var layers = Map.layers();
        if (layers.length() > 0) {
            layers.get(layers.length() - 1).setOpacity(val);
        }
    }
});
opacityRow.add(opacitySlider);
panel.add(opacityRow);

/* --- Scientific Insights Panel --- */
panel.add(ui.Label('Scientific Insights', { fontWeight: 'bold', margin: '15px 0 5px 0' }));
var insightLabel = ui.Label('Run an analysis to see scientific insights and interpretation guides here.', {
    fontSize: '11px',
    color: '#333',
    backgroundColor: '#f1f8e9', // Light green background for insights
    padding: '10px',
    border: '1px solid #c5e1a5',
    fontWeight: 'normal'
});
var insightPanel = ui.Panel({
    widgets: [insightLabel],
    style: { margin: '5px 0' }
});
panel.add(insightPanel);

/* --- Secondary Controls --- */
var controlRow = ui.Panel({ layout: ui.Panel.Layout.flow('horizontal') });
var exportButton = ui.Button({ label: '📥 Export', style: { width: '90px' } });
var resetButton = ui.Button({ label: '🔄 Reset', style: { width: '90px' } });
controlRow.add(exportButton);
controlRow.add(resetButton);
panel.add(controlRow);

var statusLabel = ui.Label('Status: Ready', { fontSize: '11px', color: '#1565c0' });
panel.add(statusLabel);

/* Chart area */
var chartPanel = ui.Panel({ style: { height: '240px', border: '1px solid #eee', margin: '10px 0' } });
panel.add(chartPanel);

ui.root.insert(0, panel);

/* =========================================================
   3️⃣ HELPER FUNCTIONS & DATA LOGIC
========================================================= */

var monthMap = { 'January': '01', 'February': '02', 'March': '03', 'April': '04', 'May': '05', 'June': '06', 'July': '07', 'August': '08', 'September': '09', 'October': '10', 'November': '11', 'December': '12' };

function getRegion(name) {
    if (name === 'Use Drawn Polygon') {
        var aoi = drawingTools.layers().get(0).getEeObject();
        // Wrapping in ee.Geometry helps handle both Features and Geometries safely
        // Ensure the AOI is not null and is a valid geometry before returning.
        if (aoi && aoi.bounds) { // Check if aoi is not null and has a bounds method (indicates a geometry)
            return ee.Geometry(aoi);
        } else {
            print('No valid polygon drawn. Please draw an AOI or select another region.');
            return null; // Return null if no valid AOI is drawn
        }
    }
    if (name === 'Whole Australia') return auBounds;
    if (globalRegions[name]) return globalRegions[name];
    if (name.indexOf('──') >= 0) return null;
    return auStates.filter(ee.Filter.eq('ADM1_NAME', name)).geometry();
}

function getChartScale(region, regionName) {
    if (regionName === 'Use Drawn Polygon') return 30;
    if (regionName === 'Whole Australia') return 50000;
    if (globalRegions[regionName]) return 50000;
    return 10000;
}

function buildNDVI(region, startDate, endDate, sensorChoice) {
    if (sensorChoice.indexOf('MODIS') >= 0) {
        return ee.ImageCollection("MODIS/061/MOD13A1").filterBounds(region).filterDate(startDate, endDate).select('NDVI')
            .map(function (img) { return img.multiply(0.0001).rename('NDVI').copyProperties(img, ['system:time_start']); });
    } else {
        return ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED").filterBounds(region).filterDate(startDate, endDate).filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20))
            .map(function (img) { return img.normalizedDifference(['B8', 'B4']).rename('NDVI').copyProperties(img, ['system:time_start']); });
    }
}

function buildMonthlyRainfall(region, startDate, endDate) { return ee.ImageCollection("UCSB-CHG/CHIRPS/DAILY").filterBounds(region).filterDate(startDate, endDate); }
function buildSoilMoisture(region, startDate, endDate) { return ee.ImageCollection("ECMWF/ERA5_LAND/MONTHLY_AGGR").filterBounds(region).filterDate(startDate, endDate).select('volumetric_soil_water_layer_1'); }
function buildET(region, startDate, endDate) { return ee.ImageCollection("MODIS/061/MOD16A2GF").filterBounds(region).filterDate(startDate, endDate).select('ET'); }
function buildLST(region, startDate, endDate) { return ee.ImageCollection("MODIS/061/MOD11A2").filterBounds(region).filterDate(startDate, endDate).select('LST_Day_1km').map(function (img) { return img.multiply(0.02).subtract(273.15).rename('LST_C').copyProperties(img, ['system:time_start']); }); }
function computeAnomaly(targetCol, baselineCol) { var baseMean = baselineCol.mean(); var baseStd = baselineCol.reduce(ee.Reducer.stdDev()); var targetMean = targetCol.mean(); var stdSafe = baseStd.where(baseStd.eq(0), 1); return targetMean.subtract(baseMean).divide(stdSafe); }

/* --- Legend Generator --- */
function updateInsights(mode) {
    var insights = {
        'NDVI Drought Anomaly': "Measures vegetation health deviations using z-scores. Green means better than average, Red indicates drought stress.",
        'SPI (Precip Index)': "Standardized Precipitation Index. Identifies meteorological drought. Negative values (Red) indicate rainfall deficit.",
        'Soil Moisture Anomaly': "Detects root-zone water stress. Red areas show where soil is significantly drier than the long-term average.",
        'Composite Drought Severity (CDSI)': "Scientific integration of NDVI, Rainfall, Soil, and Temp. Provides a holistic 'Drought Alarm' for the ecosystem.",
        'SAR Monthly Water (Annual Mean)': "Uses Radar to detect surface water. Provides a clear view of permanent water bodies, even through thick clouds.",
        'SAR Monthly View (Single Month)': "High-resolution snapshot of water for the selected month. Useful for flood/dry season monitoring.",
        'SAR Total Occurrence (Frequency)': "Cumulative water map (0-12 months). Deep Blue = Permanent Water; Light Blue = Seasonal/Ephemeral.",
        'SAR Change Intensity': "Detects changes in radar backscatter. Reveals where land has become wetter (Blue) or drier (Red).",
        'ET Anomaly (Evapotranspiration)': "Measures ecosystem 'sweating'. Lower ET (Red) suggests plants are closing stomata to save water during drought.",
        'LST Anomaly (Surface Temp)': "Maps heat stress. Red areas are hotter than usual, often driving 'Flash Droughts' and forest fires.",
        'Rainfall-NDVI Correlation': "Measures Rain-Vegetation coupling. Red indicates 'Decoupling'—where plants fail to respond to rain due to extreme damage.",
        'Vegetation Trend (Sen Slope)': "Long-term trajectory. Green = Greening/Recovery; Red = Persistent Browning/Land Degradation.",
        'NDVI Recovery Rate (Resilience)': "Measures ecosystem elasticity. Shows how quickly greenness returns after the drought ends."
    };
    insightLabel.setValue(insights[mode] || "Scientific interpretation for this mode will appear here.");
}

function makeLegend(title, palette, labels) {
    legendPanel.clear();
    legendPanel.add(ui.Label(title, { fontSize: '12px', fontWeight: 'bold', margin: '4px 0 8px 0' }));

    var blockWidth = (100 / palette.length) + '%';
    var colorBlocks = palette.map(function (color) {
        var bgColor = color;
        if (color.length === 6 && color.indexOf('#') === -1) {
            bgColor = '#' + color;
        }
        return ui.Panel({
            style: {
                backgroundColor: bgColor,
                height: '10px',
                width: blockWidth,
                margin: '0'
            }
        });
    });

    var colorBar = ui.Panel({
        widgets: colorBlocks,
        layout: ui.Panel.Layout.flow('horizontal'),
        style: {
            width: '100%',
            height: '14px',
            margin: '0 0 2px 0',
            border: '1px solid #ccc'
        }
    });

    var labelRow = ui.Panel({
        widgets: [
            ui.Label(labels[0], { fontSize: '10px', margin: '0' }),
            ui.Label(labels[labels.length - 1], { fontSize: '10px', margin: '0', textAlign: 'right', stretch: 'horizontal' })
        ],
        layout: ui.Panel.Layout.flow('horizontal'),
        style: { width: '100%' }
    });

    legendPanel.add(colorBar);
    legendPanel.add(labelRow);
}

var currentResultImage;
var currentRegion;

/* =========================================================
   4️⃣ ANALYSIS FUNCTIONS
========================================================= */

function runNDVIAnomaly(region, year, baseStart, baseEnd, regionName, sensorChoice) {
    var targetNDVI = buildNDVI(region, year + '-01-01', year + '-12-31', sensorChoice);
    var baseNDVI = buildNDVI(region, baseStart + '-01-01', baseEnd + '-12-31', sensorChoice);
    var anomaly = computeAnomaly(targetNDVI, baseNDVI).rename('NDVI_Anomaly');
    var palette = ['8B0000', 'FF4500', 'FFA500', 'FFFFFF', 'ADFF2F', '228B22', '006400'];
    Map.addLayer(anomaly.clip(region), { min: -2, max: 2, palette: palette }, 'NDVI Anomaly ' + year);
    makeLegend('NDVI Anomaly (z-score)', palette, ['Extreme Decline', 'Severe', 'Moderate', 'Normal', 'Slight Gain', 'Good', 'Excellent']);
    return anomaly;
}

function runSPI(region, year, baseStart, baseEnd) {
    var targetRain = buildMonthlyRainfall(region, year + '-01-01', year + '-12-31');
    var baseRain = buildMonthlyRainfall(region, baseStart + '-01-01', baseEnd + '-12-31');
    var baseMean = baseRain.mean(); var baseStd = baseRain.reduce(ee.Reducer.stdDev()).select(0);
    var stdSafe = baseStd.where(baseStd.eq(0), 1);
    var spi = targetRain.mean().subtract(baseMean).divide(stdSafe).rename('SPI');
    var palette = ['8B0000', 'FF8C00', 'FFFFFF', '90EE90', '006400'];
    Map.addLayer(spi.clip(region), { min: -2.5, max: 2.5, palette: palette }, 'SPI ' + year);
    makeLegend('SPI (Precipitation)', palette, ['Extreme Drought', 'Dry', 'Normal', 'Wet', 'Extreme Wet']);
    return spi;
}

function runSoilMoisture(region, year, baseStart, baseEnd, regionName) {
    var targetSM = buildSoilMoisture(region, year + '-01-01', year + '-12-31');
    var baseSM = buildSoilMoisture(region, baseStart + '-01-01', baseEnd + '-12-31');
    var anomaly = computeAnomaly(targetSM, baseSM).rename('SM_Anomaly');
    var palette = ['8B4513', 'CD853F', 'FFFFFF', '4682B4', '00008B'];
    Map.addLayer(anomaly.clip(region), { min: -2, max: 2, palette: palette }, 'SM Anomaly ' + year);
    makeLegend('Soil Moisture Anomaly', palette, ['Very Dry', 'Dry', 'Normal', 'Wet', 'Very Wet']);
    return anomaly;
}

/* (Other functions CDSI, ET, LST, Trend, Recovery carry over but with Legend addition) */
function runCDSI(region, year, baseStart, baseEnd, regionName, sensorChoice) {
    var ndviA = computeAnomaly(buildNDVI(region, year + '-01-01', year + '-12-31', sensorChoice), buildNDVI(region, baseStart + '-01-01', baseEnd + '-12-31', sensorChoice));
    var spiVal = (function () { var tR = buildMonthlyRainfall(region, year + '-01-01', year + '-12-31'); var bR = buildMonthlyRainfall(region, baseStart + '-01-01', baseEnd + '-12-31'); var bm = bR.mean(); var bs = bR.reduce(ee.Reducer.stdDev()).select(0); return tR.mean().subtract(bm).divide(bs.where(bs.eq(0), 1)); })();
    var smA = computeAnomaly(buildSoilMoisture(region, year + '-01-01', year + '-12-31'), buildSoilMoisture(region, baseStart + '-01-01', baseEnd + '-12-31'));
    var lstA = computeAnomaly(buildLST(region, year + '-01-01', year + '-12-31'), buildLST(region, baseStart + '-01-01', baseEnd + '-12-31')).multiply(-1);
    var cdsi = ndviA.multiply(0.30).add(spiVal.multiply(0.25)).add(smA.multiply(0.25)).add(lstA.multiply(0.20)).rename('CDSI');
    var palette = ['8B0000', 'FF0000', 'FF8C00', 'FFFF00', 'FFFFFF', '32CD32', '006400'];
    Map.addLayer(cdsi.clip(region), { min: -2.5, max: 2.5, palette: palette }, 'CDSI ' + year);
    makeLegend('Composite Severity Index', palette, ['D4 (Extreme)', 'D3 (Severe)', 'D2', 'D1', 'Normal', 'Wet', 'V. Wet']);
    return cdsi;
}

function buildSAR(region, startDate, endDate) {
    return ee.ImageCollection("COPERNICUS/S1_GRD")
        .filterBounds(region)
        .filterDate(startDate, endDate)
        .filter(ee.Filter.eq('instrumentMode', 'IW'))
        .map(function (img) {
            var bands = img.bandNames();
            return ee.Image(ee.Algorithms.If(
                bands.contains('VV'),
                img.select('VV'),
                ee.Image.constant(0).rename('VV').updateMask(0)
            )).copyProperties(img, ['system:time_start']);
        });
}

function runSARWater(region, year) {
    var collection = buildSAR(region, year + '-01-01', year + '-12-31');
    print('SAR Images Found:', collection.size());
    var sar = collection.mean();
    var water = sar.lt(-16).rename('SAR_Water');
    var palette = ['FFFFFF', '0000FF'];
    Map.addLayer(water.selfMask().clip(region), { palette: palette }, 'SAR Water ' + year);
    makeLegend('SAR Monthly Water', palette, ['Land', 'Water']);
    return water;
}

function runSARMonthlyView(region, year, monthName) {
    var month = monthMap[monthName];
    var startDate = ee.Date.fromYMD(year, ee.Number.parse(month), 1);
    var endDate = startDate.advance(1, 'month').advance(-1, 'day');
    var collection = buildSAR(region, startDate, endDate);
    print('SAR Images Found (Month):', collection.size());
    var sar = collection.mean();
    var water = sar.lt(-16).rename('SAR_Monthly_Water');
    var palette = ['FFFFFF', '0000FF'];
    Map.addLayer(water.selfMask().clip(region), { palette: palette }, 'SAR Water ' + monthName + ' ' + year);
    makeLegend('SAR Water (' + monthName + ')', palette, ['Land', 'Water']);
    return water;
}

function runSAROccurrence(region, year) {
    var months = ee.List.sequence(1, 12);
    var occurrence = ee.ImageCollection.fromImages(months.map(function (m) {
        var startDate = ee.Date.fromYMD(year, m, 1);
        var endDate = startDate.advance(1, 'month').advance(-1, 'day');
        var water = buildSAR(region, startDate, endDate).mean().lt(-16);
        return water.unmask(0).rename('water');
    })).sum().rename('SAR_Occurrence');

    var palette = ['FFFFFF', 'ebf4f5', 'bde0e5', '8ecbd5', '5fb7c5', '30a2b5', '008ea5', '007a8e', '006577', '005160', '003c49', '002832', '00141b'];
    Map.addLayer(occurrence.clip(region), { min: 0, max: 12, palette: palette }, 'SAR Water Occurrence ' + year);
    makeLegend('Water Frequency (Months)', palette, ['0', '12']);
    return occurrence;
}

function runSARChange(region, year, baseStart, baseEnd) {
    var targetSAR = buildSAR(region, year + '-01-01', year + '-12-31').mean();
    var baseSAR = buildSAR(region, baseStart + '-01-01', baseEnd + '-12-31').mean();
    var change = targetSAR.subtract(baseSAR).rename('SAR_Change');
    var palette = ['D7191C', 'FDAE61', 'FFFFBF', 'ABD9E9', '2C7BB6'];
    Map.addLayer(change.clip(region), { min: -5, max: 5, palette: palette }, 'SAR Intensity Change');
    makeLegend('SAR Change Intensity (dB)', palette, ['Decrease', 'Stable', 'Increase']);
    return change;
}

function runETAnomaly(region, year, baseStart, baseEnd) {
    var targetET = buildET(region, year + '-01-01', year + '-12-31');
    var baseET = buildET(region, baseStart + '-01-01', baseEnd + '-12-31');
    var anomaly = computeAnomaly(targetET, baseET).rename('ET_Anomaly');
    var palette = ['8B4513', 'CD853F', 'FFFFFF', '4682B4', '00008B'];
    Map.addLayer(anomaly.clip(region), { min: -2, max: 2, palette: palette }, 'ET Anomaly ' + year);
    makeLegend('ET Anomaly', palette, ['Very Low', 'Low', 'Normal', 'High', 'Very High']);
    return anomaly;
}

function runLSTAnomaly(region, year, baseStart, baseEnd) {
    var targetLST = buildLST(region, year + '-01-01', year + '-12-31');
    var baseLST = buildLST(region, baseStart + '-01-01', baseEnd + '-12-31');
    var anomaly = computeAnomaly(targetLST, baseLST).rename('LST_Anomaly');
    var palette = ['0000FF', 'ADFF2F', 'FFFFFF', 'FFA500', 'FF0000'];
    Map.addLayer(anomaly.clip(region), { min: -2, max: 2, palette: palette }, 'LST Anomaly ' + year);
    makeLegend('LST Anomaly', palette, ['Cooler', 'Normal', 'Hotter', 'Extreme Heat']);
    return anomaly;
}

function runCorrelation(region, year, baseStart, baseEnd, sensorChoice) {
    var targetNDVI = buildNDVI(region, year + '-01-01', year + '-12-31', sensorChoice).mean();
    var targetRain = buildMonthlyRainfall(region, year + '-01-01', year + '-12-31').mean();
    var corr = targetNDVI.divide(targetRain.add(1)).rename('Correlation');
    var palette = ['FF0000', 'FFFF00', '008000'];
    Map.addLayer(corr.clip(region), { min: 0, max: 0.1, palette: palette }, 'Rain-NDVI Relationship');
    makeLegend('Rain-NDVI Response', palette, ['Low', 'Moderate', 'High']);
    return corr;
}

function runTrend(region, year, baseStart, baseEnd, sensorChoice) {
    var collection = buildNDVI(region, baseStart + '-01-01', year + '-12-31', sensorChoice);
    var trend = collection.reduce(ee.Reducer.sensSlope()).select('slope').rename('Trend');
    var palette = ['FF0000', 'FFFFFF', '008000'];
    Map.addLayer(trend.clip(region), { min: -0.01, max: 0.01, palette: palette }, 'Vegetation Trend');
    makeLegend('Vegetation Trend', palette, ['Declining', 'Stable', 'Improving']);
    return trend;
}

function runRecovery(region, year, baseStart, baseEnd, sensorChoice) {
    var postNDVI = buildNDVI(region, year + '-01-01', year + '-12-31', sensorChoice).mean();
    var preNDVI = buildNDVI(region, (year - 1) + '-01-01', (year - 1) + '-12-31', sensorChoice).mean();
    var recovery = postNDVI.subtract(preNDVI).divide(preNDVI.add(0.01)).rename('Recovery');
    var palette = ['FF0000', 'FFA500', 'FFFFFF', '90EE90', '006400'];
    Map.addLayer(recovery.clip(region), { min: -0.5, max: 0.5, palette: palette }, 'Recovery Rate');
    makeLegend('Resilience (Recovery)', palette, ['Degraded', 'Slow', 'Stable', 'Fast', 'Excellent']);
    return recovery;
}

/* =========================================================
   5️⃣ MAIN RUN & EVENTS
========================================================= */

runButton.onClick(function () {
    statusLabel.setValue('Status: Processing...');
    chartPanel.clear();
    Map.layers().reset();
    currentResultImage = null; // Reset previous result

    var mode = modeSelect.getValue();
    if (mode.indexOf('──') >= 0) {
        statusLabel.setValue('Status: Please select a valid mode');
        return;
    }

    var regionName = regionSelect.getValue();
    statusLabel.setValue('Status: Processing...');
    insightLabel.setValue('Analyzing data... Scientific insights will appear here shortly.');

    // Hide the solid drawing layer to reveal results
    var drawingLayer = drawingTools.layers().get(0);
    if (drawingLayer) drawingLayer.setShown(false);

    var region = getRegion(regionName);
    if (!region) { statusLabel.setValue('Status: Error (Invalid AOI)'); return; }
    var year = parseInt(yearSelect.getValue());
    var mode = modeSelect.getValue();
    var baseStart = baseStartSelect.getValue();
    var baseEnd = baseEndSelect.getValue();
    var sensorChoice = sensorSelect.getValue();
    currentRegion = region;
    Map.centerObject(region);
    var month = monthSelect.getValue();

    print('Running Mode:', mode, 'Year:', year, 'Region:', regionName);

    try {
        if (mode === 'NDVI Drought Anomaly') currentResultImage = runNDVIAnomaly(region, year, baseStart, baseEnd, regionName, sensorChoice);
        else if (mode === 'SPI (Precip Index)') currentResultImage = runSPI(region, year, baseStart, baseEnd);
        else if (mode === 'Soil Moisture Anomaly') currentResultImage = runSoilMoisture(region, year, baseStart, baseEnd, regionName);
        else if (mode === 'Composite Drought Severity (CDSI)') currentResultImage = runCDSI(region, year, baseStart, baseEnd, regionName, sensorChoice);
        else if (mode === 'SAR Monthly Water (Annual Mean)') currentResultImage = runSARWater(region, year);
        else if (mode === 'SAR Monthly View (Single Month)') currentResultImage = runSARMonthlyView(region, year, month);
        else if (mode === 'SAR Total Occurrence (Frequency)') currentResultImage = runSAROccurrence(region, year);
        else if (mode === 'SAR Change Intensity') currentResultImage = runSARChange(region, year, baseStart, baseEnd);
        else if (mode === 'ET Anomaly (Evapotranspiration)') currentResultImage = runETAnomaly(region, year, baseStart, baseEnd);
        else if (mode === 'LST Anomaly (Surface Temp)') currentResultImage = runLSTAnomaly(region, year, baseStart, baseEnd);
        else if (mode === 'Rainfall-NDVI Correlation') currentResultImage = runCorrelation(region, year, baseStart, baseEnd, sensorChoice);
        else if (mode === 'Vegetation Trend (Sen Slope)') currentResultImage = runTrend(region, year, baseStart, baseEnd, sensorChoice);
        else if (mode === 'NDVI Recovery Rate (Resilience)') currentResultImage = runRecovery(region, year, baseStart, baseEnd, sensorChoice);

        if (currentResultImage) {
            statusLabel.setValue('Status: ✅ Analysis Ready');
            updateInsights(mode);

            // Add a hollow AOI outline so results underneath are visible
            var outline = ee.Image().paint(region, 0, 2); // 2px red outline
            Map.addLayer(outline, { palette: 'FF0000' }, 'AOI Outline');

            // Hide the solid drawing tools to clear the view
            drawingTools.setShown(false);

            print('Success: Result added to map.');
        } else {
            statusLabel.setValue('Status: ⚠️ Mode not implemented');
        }
    } catch (e) {
        statusLabel.setValue('Status: ❌ Error: ' + e);
        print('Error during analysis:', e);
    }
    opacitySlider.setValue(1);
});

exportButton.onClick(function () {
    if (!currentResultImage) { statusLabel.setValue('Status: Run Analysis first'); return; }
    var month = monthSelect.getValue();
    var mode = modeSelect.getValue().split('(')[0].trim().replace(/\s+/g, '_');
    var fn = 'DL_' + mode + '_' + (yearSelect.getValue());
    if (mode.indexOf('Monthly_View') >= 0) fn += '_' + month;

    Export.image.toDrive({
        image: currentResultImage.clip(currentRegion).toFloat(),
        description: fn,
        folder: 'DroughtLens_Exports',
        fileNamePrefix: fn,
        region: currentRegion,
        scale: 1000,
        maxPixels: 1e13,
        fileFormat: 'GeoTIFF'
    });
    statusLabel.setValue('Status: 📩 Export Task Queued. Check "Tasks" tab!');
});

resetButton.onClick(function () {
    Map.layers().reset();
    chartPanel.clear();
    legendPanel.clear();
    var layers = drawingTools.layers();
    if (layers.length() > 0) {
        layers.get(0).geometries().reset();
    }
    statusLabel.setValue('Status: Reset Done');
    insightLabel.setValue('Run an analysis to see scientific insights and interpretation guides here.');
});

panel.add(ui.Label('© 2026 DroughtLens | Ecosystem Drought Response Platform', { fontSize: '10px', color: '#999', textAlign: 'center', margin: '20px 0' }));
