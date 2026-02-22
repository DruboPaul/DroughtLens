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
        drawingTools.draw();
        regionSelect.setValue('Use Drawn Polygon');
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
        'SAR Monthly Water',
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
// Using ui.Label styled as a button for guaranteed background color application
var runButton = ui.Label({
    value: '▶  RUN ANALYSIS',
    style: {
        backgroundColor: '#1B5E20', // Forest Green for action
        color: '#ffffff',           // Distinct white text
        fontWeight: 'bold',
        fontSize: '14px',
        textAlign: 'center',
        padding: '12px',
        width: '100%',
        margin: '20px 0',
        border: '2px solid #144316'
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
        return aoi ? aoi.geometry() : null;
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
function makeLegend(title, palette, labels) {
    legendPanel.clear();
    legendPanel.add(ui.Label(title, { fontSize: '12px', fontWeight: 'bold' }));
    for (var i = 0; i < palette.length; i++) {
        var rec = ui.Panel({ style: { backgroundColor: palette[i], height: '12px', width: '20px', margin: '2px 4px 0 0' } });
        var lb = ui.Label(labels[i], { fontSize: '11px', margin: '2px 0' });
        legendPanel.add(ui.Panel({ layout: ui.Panel.Layout.flow('horizontal'), children: [rec, lb] }));
    }
}

/* =========================================================
   4️⃣ ANALYSIS FUNCTIONS
========================================================= */

function runNDVIAnomaly(region, year, baseStart, baseEnd, regionName, sensorChoice) {
    var targetNDVI = buildNDVI(region, year + '-01-01', year + '-12-31', sensorChoice);
    var baseNDVI = buildNDVI(region, baseStart + '-01-01', baseEnd + '-12-31', sensorChoice);
    var anomaly = computeAnomaly(targetNDVI, baseNDVI).rename('NDVI_Anomaly');
    var palette = ['8B0000', 'FF4500', 'FFA500', 'white', 'ADFF2F', '228B22', '006400'];
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
    var palette = ['8B0000', 'FF8C00', 'white', '90EE90', '006400'];
    Map.addLayer(spi.clip(region), { min: -2.5, max: 2.5, palette: palette }, 'SPI ' + year);
    makeLegend('SPI (Precipitation)', palette, ['Extreme Drought', 'Dry', 'Normal', 'Wet', 'Extreme Wet']);
    return spi;
}

function runSoilMoisture(region, year, baseStart, baseEnd, regionName) {
    var targetSM = buildSoilMoisture(region, year + '-01-01', year + '-12-31');
    var baseSM = buildSoilMoisture(region, baseStart + '-01-01', baseEnd + '-12-31');
    var anomaly = computeAnomaly(targetSM, baseSM).rename('SM_Anomaly');
    var palette = ['8B4513', 'CD853F', 'white', '4682B4', '00008B'];
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
    var palette = ['8B0000', 'FF0000', 'FF8C00', 'FFFF00', 'white', '32CD32', '006400'];
    Map.addLayer(cdsi.clip(region), { min: -2.5, max: 2.5, palette: palette }, 'CDSI ' + year);
    makeLegend('Composite Severity Index', palette, ['D4 (Extreme)', 'D3 (Severe)', 'D2', 'D1', 'Normal', 'Wet', 'V. Wet']);
    return cdsi;
}

/* =========================================================
   5️⃣ MAIN RUN & EVENTS
========================================================= */

runButton.onClick(function () {
    statusLabel.setValue('Status: Processing...');
    chartPanel.clear();
    Map.layers().reset();
    var regionName = regionSelect.getValue();
    var region = getRegion(regionName);
    if (!region) { statusLabel.setValue('Status: Error (Invalid AOI)'); return; }
    var year = parseInt(yearSelect.getValue());
    var mode = modeSelect.getValue();
    var baseStart = baseStartSelect.getValue();
    var baseEnd = baseEndSelect.getValue();
    var sensorChoice = sensorSelect.getValue();
    Map.centerObject(region);
    Map.addLayer(ee.Image().paint(region, 0, 1.5), { palette: ['333333'] }, 'Boundary');

    if (mode === 'NDVI Drought Anomaly') currentResultImage = runNDVIAnomaly(region, year, baseStart, baseEnd, regionName, sensorChoice);
    else if (mode === 'SPI (Precip Index)') currentResultImage = runSPI(region, year, baseStart, baseEnd);
    else if (mode === 'Soil Moisture Anomaly') currentResultImage = runSoilMoisture(region, year, baseStart, baseEnd, regionName);
    else if (mode === 'Composite Drought Severity (CDSI)') currentResultImage = runCDSI(region, year, baseStart, baseEnd, regionName, sensorChoice);
    // (Other modes follow same pattern...)

    if (currentResultImage) statusLabel.setValue('Status: ✅ Analysis Ready');
    opacitySlider.setValue(1);
});

exportButton.onClick(function () {
    if (!currentResultImage) { statusLabel.setValue('Status: Run Analysis first'); return; }
    var fn = 'DL_' + (yearSelect.getValue());
    Export.image.toDrive({ image: currentResultImage.clip(currentRegion).toFloat(), description: fn, folder: 'DroughtLens_Exports', fileNamePrefix: fn, region: currentRegion, scale: 1000, maxPixels: 1e13, fileFormat: 'GeoTIFF' });
    statusLabel.setValue('Status: 📩 Export Task Queued');
});

resetButton.onClick(function () {
    Map.layers().reset();
    chartPanel.clear();
    legendPanel.clear();
    drawingTools.layers().get(0).setEeObject(ee.List([]));
    statusLabel.setValue('Status: Reset Done');
});
